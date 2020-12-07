import { Indexable } from './misc';

export interface UserToUpdateDto extends Indexable {
  firstName?: string;
  lastName?: string;
}
