"use client";

import { ImageUp, X, UserRound, Phone } from "lucide-react";
/* eslint-disable @next/next/no-img-element -- local preview of a chosen file */
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { AuditNotice } from "@/components/patterns/action-dialog";
import { FormRow } from "@/components/patterns/form-row";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { describedBy, IconInput } from "@/components/ui/field";
import { CopyButton } from "@/components/ui/copy-button";
import { Modal } from "@/components/ui/modal";
import { Banner } from "@/components/ui/surface";
import type { ApiError } from "@/lib/api/errors";
import { type AdminUserDetail, LIMITS } from "@/lib/api/types";
import { editProfile, uploadProfilePicture } from "./actions";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Edit profile (reference D): label-left rows, Cancel and Save at the
 * bottom right. Only fields the operator changed are sent. A new photo is
 * uploaded first; if that fails nothing else is saved.
 */
interface Props {
  open: boolean;
  onClose: () => void;
  user: AdminUserDetail;
  onSaved: (user: AdminUserDetail) => void;
}

/** Mounted only while open, so every opening starts from the current record. */
export function EditProfileDialog(props: Props) {
  return props.open ? <EditProfileModal {...props} /> : null;
}

function EditProfileModal({ open, onClose, user, onSaved }: Props) {
  const usernameId = useId();
  const phoneId = useId();
  const fileId = useId();
  const fileInput = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState(user.username ?? "");
  const [phone, setPhone] = useState(user.phone_number ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string>();
  const [error, setError] = useState<ApiError | null>(null);
  const [pending, startTransition] = useTransition();

  // Release the preview's object URL when it's replaced or the dialog closes.
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const pickFile = (f: File | null) => {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const changes: { username?: string; phone_number?: string } = {};
  if (username.trim() !== (user.username ?? "")) changes.username = username.trim();
  if (phone.trim() !== (user.phone_number ?? "")) changes.phone_number = phone.trim();
  const dirty = Object.keys(changes).length > 0 || !!file;

  // Checked locally first, matching the API's validators.
  const localUsernameError =
    "username" in changes && changes.username!.length < LIMITS.usernameMin
      ? "Enter a username."
      : username.trim().length > LIMITS.usernameMax
        ? `Usernames can be up to ${LIMITS.usernameMax} characters.`
        : undefined;
  const localPhoneError =
    phone.trim().length > LIMITS.phoneNumber ? `Phone numbers can be up to ${LIMITS.phoneNumber} characters.` : undefined;
  const invalid = !!(localUsernameError || localPhoneError || fileError);

  // 409 is the only conflict this endpoint returns: the username is taken.
  const usernameError = localUsernameError ?? error?.fieldErrors?.username ?? (error?.status === 409 ? error.message : undefined);
  const phoneError = localPhoneError ?? error?.fieldErrors?.phone_number;

  const chooseFile = (f: File | undefined) => {
    setError(null);
    if (!f) return;
    if (!IMAGE_TYPES.includes(f.type)) {
      setFileError("Choose a JPEG, PNG, WebP or GIF image.");
      return;
    }
    if (f.size > LIMITS.imageMaxBytes) {
      setFileError("That image is over 10 MB. Choose a smaller one.");
      return;
    }
    setFileError(undefined);
    pickFile(f);
  };

  const save = () => {
    if (!dirty || invalid) return;
    setError(null);
    startTransition(async () => {
      let latest: AdminUserDetail | null = null;
      if (file) {
        const body = new FormData();
        body.set("file", file);
        const uploaded = await uploadProfilePicture(user.id, body);
        if (!uploaded.ok) {
          setError({ ...uploaded.error, message: `The photo wasn't saved. ${uploaded.error.message}` });
          return;
        }
        latest = uploaded.data;
        pickFile(null);
      }
      if (Object.keys(changes).length > 0) {
        const edited = await editProfile(user.id, changes);
        if (!edited.ok) {
          if (latest) onSaved(latest); // the photo did save
          setError(edited.error);
          return;
        }
        latest = edited.data;
      }
      if (latest) onSaved(latest);
      onClose();
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      busy={pending}
      title="Edit profile"
      identity={{
        name: user.username ?? user.email,
        subtitle: user.email,
        avatar: preview ? <img src={preview} alt="New profile photo preview" className="size-16 rounded-full object-cover" /> : <Avatar src={user.profile_picture} name={user.username ?? user.email} size="lg" />,
        actions: <CopyButton value={user.email} label="email" variant="button" />,
      }}
      description="Correct this user's username, phone number or photo."
      footer={
        <>
          <Button onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save} loading={pending} disabled={!dirty || invalid}>
            Save changes
          </Button>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="flex flex-col gap-5"
      >
        <div className="flex flex-col">
          <FormRow label="Profile photo" error={fileError}>
            <div className="flex flex-wrap items-center gap-4">
              {preview ? (
                <img src={preview} alt="New profile photo preview" className="size-16 rounded-full object-cover" />
              ) : (
                <Avatar src={user.profile_picture} name={user.username ?? user.email} size="lg" />
              )}
              <input
                ref={fileInput}
                id={fileId}
                type="file"
                accept={IMAGE_TYPES.join(",")}
                className="sr-only"
                onChange={(e) => chooseFile(e.target.files?.[0])}
                aria-label="Choose a new profile photo"
              />
              <Button icon={<ImageUp className="size-4" />} onClick={() => fileInput.current?.click()} disabled={pending}>
                {file ? "Choose a different photo" : "Click to replace"}
              </Button>
              {file && (
                <Button
                  variant="ghost"
                  icon={<X className="size-4" />}
                  onClick={() => {
                    pickFile(null);
                    if (fileInput.current) fileInput.current.value = "";
                  }}
                  disabled={pending}
                >
                  Keep current photo
                </Button>
              )}
            </div>
            <p className="text-sm text-fg-muted">JPEG, PNG, WebP or GIF, up to 10 MB.</p>
          </FormRow>
          <FormRow id={usernameId} label="Username" error={usernameError}>
            <IconInput
              icon={<UserRound />}
              id={usernameId}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(null);
              }}
              maxLength={LIMITS.usernameMax + 10}
              autoComplete="off"
              data-autofocus
              {...describedBy(usernameId, { error: usernameError })}
            />
          </FormRow>
          <FormRow id={phoneId} label="Phone number" error={phoneError} hint="Include the country code, for example +234.">
            <IconInput
              icon={<Phone />}
              id={phoneId}
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setError(null);
              }}
              autoComplete="off"
              {...describedBy(phoneId, { hint: true, error: phoneError })}
            />
          </FormRow>
        </div>
        {error && !error.fieldErrors && error.status !== 409 && (
          <Banner tone="danger" title="Couldn't save the profile">
            {error.message}
          </Banner>
        )}
        <AuditNotice />
      </form>
    </Modal>
  );
}
