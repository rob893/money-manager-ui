<template>
  <div>
    <v-data-table
      @click:row="viewBudgetDetails"
      :headers="headers"
      :items="budgets"
      :items-per-page="5"
      :loading="budgetsLoading"
      loading-text="Loading... Please wait"
      class="elevation-1 table-row-cursor"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Budgets</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-spacer></v-spacer>
          <v-dialog v-model="dialog" persistent max-width="600px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" dark v-bind="attrs" v-on="on">Create Budget</v-btn>
            </template>

            <v-card>
              <v-form ref="createBudgetForm" v-model="formValid" @submit.prevent="createBudget">
                <v-card-title>
                  <span class="headline">Create New Budget</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          label="Name*"
                          :rules="budgetNameRules"
                          v-model="budgetToCreate.name"
                          required
                        ></v-text-field>
                      </v-col>

                      <v-col cols="12">
                        <v-textarea label="Description" v-model="budgetToCreate.description"></v-textarea>
                      </v-col>

                      <v-col cols="12" sm="6">
                        <v-select
                          :items="taxFilingStatuses"
                          label="Tax Filing Status"
                          required
                          @change="value => (budgetToCreate.taxFilingStatus = value.replace(/ /g, ''))"
                        ></v-select>
                      </v-col>
                    </v-row>
                  </v-container>

                  <small>*indicates required field</small>
                </v-card-text>

                <v-card-actions v-if="loading" class="justify-center">
                  <v-progress-circular indeterminate color="primary" />
                </v-card-actions>

                <v-card-actions v-else>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="dialog = false">Close</v-btn>
                  <v-btn color="blue darken-1" text type="submit" :disabled="!formValid">Create</v-btn>
                </v-card-actions>
              </v-form>
            </v-card>
          </v-dialog>

          <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="headline">Are you sure you want to delete this item?</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDelete">Cancel</v-btn>
                <v-btn color="blue darken-1" text @click="confirmDeleteStagedBudget">OK</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-icon small @click.stop.prevent="stageBudgetForDelete(item)">mdi-delete</v-icon>
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { DataTableHeader } from 'vuetify';
import { authService, budgetService, userService } from '@/services';
import { TaxFilingStatus, CreateBudgetDto, Budget } from '@/models';
import { Utilities } from '@/helpers';
import { RouteName } from '@/router/RouteName';

export default Vue.extend({
  name: 'Budgets',

  data: () => ({
    dialog: false,
    dialogDelete: false,
    loading: false,
    taxFilingStatuses: Object.values(TaxFilingStatus).map(value => Utilities.splitAtUpperCase(value)),
    formValid: false,
    budgetNameRules: [(name: string) => !!name || 'Name is required'],
    budgetToCreate: {} as CreateBudgetDto,
    errorMessage: null as null | string,
    budgetsLoading: true,
    budgets: [] as Budget[],
    stagedBudgetForDelete: null as Budget | null,
    headers: [
      {
        text: 'Name',
        value: 'name'
      },
      {
        text: 'Description',
        value: 'description'
      },
      {
        text: 'Actions',
        value: 'actions',
        sortable: false
      }
    ] as DataTableHeader[]
  }),

  async mounted(): Promise<void> {
    this.budgetsLoading = true;
    this.budgets = await userService.getBudgetsForUser(this.userId);
    this.budgetsLoading = false;
  },

  methods: {
    viewBudgetDetails(selectedBudget: Budget): void {
      this.$router.push({ name: RouteName.Budget, params: { id: selectedBudget.id.toString() } });
    },

    async createBudget(): Promise<void> {
      if (!this.budgetToCreate.name) {
        return;
      }
      this.loading = true;

      try {
        const newBudget = await budgetService.createBudget({ ...this.budgetToCreate, userId: this.userId });
        this.budgets.push(newBudget);
      } catch (error) {
        this.errorMessage = 'Unable to create budget.';
      } finally {
        this.dialog = false;
        this.loading = false;
      }
    },

    stageBudgetForDelete(budget: Budget): void {
      this.stagedBudgetForDelete = budget;
      this.dialogDelete = true;
    },

    closeDelete(): void {
      this.stagedBudgetForDelete = null;
      this.dialogDelete = false;
    },

    async confirmDeleteStagedBudget(): Promise<void> {
      if (!this.stagedBudgetForDelete) {
        this.errorMessage = 'There is no staged budget to delete.';
        this.closeDelete();
        return;
      }

      try {
        await budgetService.deleteBudget(this.stagedBudgetForDelete.id);
        this.budgets.splice(this.budgets.indexOf(this.stagedBudgetForDelete), 1);
      } catch {
        this.errorMessage = 'Unable to delete budget.';
      } finally {
        this.closeDelete();
      }
    }
  },

  computed: {
    userId(): number {
      const id = authService.loggedInUser?.id;

      if (!id) {
        throw new Error('User is not logged in.');
      }

      return id;
    }
  }
});
</script>

<style scoped>
.table-row-cursor >>> tbody tr :hover {
  cursor: pointer;
}
</style>
