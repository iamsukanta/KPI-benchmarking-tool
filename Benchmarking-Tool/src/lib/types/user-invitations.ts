export type UserInvitation = {
  id: number;
  email: string;
  role: string;
  expires_at: string;
  is_expired: boolean;
}

export type UserInvitationResponse = {
  status: string;
  results: UserInvitation[];
}

export type InvitationGenericSuccessResponse = {
  status: 'success';
  message: string;
}

export type InviteUserValidationResponse = {
  status: 'error';
  errors: {
    email: string[]
  }
}

export type InviteUserResponse = 
  | InvitationGenericSuccessResponse
  | InviteUserValidationResponse;

export type GenericInvitationResponse = {
  status: 'success' | 'error';
  message: string;
}

type VerifiedInvitationRequest = {
  status: 'success';
  results: string;
}

type UnverifiedInvitationRequest = {
  status: 'error';
  message: string;
}

export type InvitationVerificationRequest =
  | VerifiedInvitationRequest
  | UnverifiedInvitationRequest;

export type AcceptInvitationValidationResopnse = {
  status: 'error';
  errors: Record<string, string[]>;
}

export type AcceptInvitationResponse =
  | InvitationGenericSuccessResponse
  | AcceptInvitationValidationResopnse;
