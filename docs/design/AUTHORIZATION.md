# Authorization

## Model

InkFlow uses ownership-based authorization.

Authentication identifies the user. Authorization decides whether the
authenticated user may perform the requested action.

## Authorization Matrix

| Resource | Action | Rule |
| --- | --- | --- |
| User | Read public profile | Anyone may read public profile fields. |
| User | Update profile | Only the profile owner. |
| User | Delete account | Only the account owner. |
| Post | Read published post | Anyone. |
| Post | Read draft | Only the post owner. |
| Post | Create | Authenticated user. |
| Post | Update | Only the post owner. |
| Post | Delete | Only the post owner. |
| Draft | Save | Only the draft owner. |
| Draft | Publish | Only the draft owner. |
| Comment | Create | Authenticated user. |
| Comment | Delete | Only the comment owner. |
| Bookmark | Toggle | Authenticated user for their own account only. |
| Bookmark | List | Only the owning user. |
| Like | Toggle | Authenticated user for their own account only. |

## Service Responsibility

Authorization decisions belong in the service layer. Controllers must not
implement ownership checks directly.

Repositories may expose data needed for authorization but must not decide
whether an action is allowed.
