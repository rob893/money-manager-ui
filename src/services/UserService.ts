import axios from 'axios';
import { User } from '@/models/entities';
import { authService } from './AuthService';
import { MoneyManagerAuthenticatedBaseService } from './MoneyManagerAuthenticatedBaseService';
import { CursorPaginatedResponse, JSONPatchDocument } from '@/models/misc';
import { UserToUpdateDto } from '@/models/dtos';

export class UserService extends MoneyManagerAuthenticatedBaseService {
  public async getUsers(): Promise<User[]> {
    const {
      data: { nodes }
    } = await this.httpClient.get<CursorPaginatedResponse<User>>('users');

    return nodes;
  }

  public async getUser(id: number): Promise<User | null> {
    const { data } = await this.httpClient.get<User | null>(`users/${id}`);

    return data;
  }

  public async updateUser(id: number, fieldsToUpdate: UserToUpdateDto): Promise<User> {
    const patchDoc: JSONPatchDocument[] = [];

    Object.keys(fieldsToUpdate).forEach(key => {
      const value = fieldsToUpdate[key];

      if (!value) {
        return;
      }

      patchDoc.push({
        op: 'add',
        path: `/${key}`,
        value
      });
    });

    const { data } = await this.httpClient.patch<User>(`users/${id}`, patchDoc);

    return data;
  }
}

export const userService = new UserService(axios, authService);
