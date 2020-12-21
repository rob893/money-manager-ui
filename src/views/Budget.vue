<template>
  <div>
    <h1>{{ budget.name }}</h1>
    <v-data-table
      :headers="incomeHeaders"
      :items="budget.incomes"
      :items-per-page="5"
      class="elevation-1"
      :loading="budgetLoading"
      loading-text="Loading... Please wait"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Incomes</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-spacer></v-spacer>
          <v-dialog v-model="addIncomeDialog" persistent max-width="600px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" dark v-bind="attrs" v-on="on"> Add Income </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="headline">Create New Budget</span>
              </v-card-title>
              <v-card-text>
                <v-form ref="addIncomeForm" v-model="addIncomeFormValid">
                  <v-container>
                    <v-row>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          label="Name*"
                          :rules="nameRules"
                          v-model="incomeToAdd.name"
                          required
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12">
                        <v-textarea label="Description" v-model="incomeToAdd.description"></v-textarea>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-select
                          :items="incomeTypes"
                          label="Income Type"
                          required
                          @change="value => (incomeToAdd.incomeType = value.replace(/ /g, ''))"
                        ></v-select>
                      </v-col>
                    </v-row>
                  </v-container>
                  <small>*indicates required field</small>
                </v-form>
              </v-card-text>

              <v-card-actions v-if="addIncomeDialogLoading">
                <v-progress-circular indeterminate color="primary" />
              </v-card-actions>

              <v-card-actions v-else>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="addIncomeDialog = false"> Close </v-btn>
                <v-btn color="blue darken-1" text @click="addIncomeDialog = false" :disabled="!addIncomeDialog">
                  Add
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <!-- <v-dialog v-model="dialogDelete" max-width="500px">
            <v-card>
              <v-card-title class="headline">Are you sure you want to delete this item?</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDelete">Cancel</v-btn>
                <v-btn color="blue darken-1" text @click="confirmDeleteStagedBudget">OK</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog> -->
        </v-toolbar>
      </template>

      <!-- <template v-slot:[`item.actions`]="{ item }">
        <v-icon small> mdi-delete </v-icon>
      </template> -->
    </v-data-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { DataTableHeader } from 'vuetify';
import { Budget, Income, IncomeType } from '@/models/entities';
import { Utilities } from '@/helpers/Utilities';
import { budgetService, userService, authService } from '@/services';
import { CreateIncomeForBudgetDto } from '@/models/dtos';

export default Vue.extend({
  name: 'Budget',

  data: () => ({
    addIncomeFormValid: false,
    addIncomeDialog: false,
    addIncomeDialogLoading: false,
    incomeTypes: Object.values(IncomeType).map(Utilities.splitAtUpperCase),
    nameRules: [(name: string) => !!name || 'Name is required'],
    incomeToAdd: {} as CreateIncomeForBudgetDto,
    budgetLoading: false,
    budgetId: null as number | null,
    budget: {} as Budget,
    errorMessage: null as string | null,
    incomeHeaders: [
      {
        text: 'Name',
        value: 'name'
      },
      {
        text: 'Description',
        value: 'description'
      },
      {
        text: 'Type',
        value: 'incomeType'
      },
      {
        text: 'Amount',
        value: 'amount'
      },
      {
        text: 'Actions',
        value: 'actions',
        sortable: false
      }
    ] as (DataTableHeader<Income> & { value: [keyof Budget] })[]
  }),

  methods: {
    async getBudget(): Promise<void> {
      const budget = await userService.getBudgetsForUser(this.userId || 0);
      console.log(budget);
    }
  },

  computed: {
    userId(): number | null {
      return authService.loggedInUser?.id || null;
    }
  },

  async mounted(): Promise<void> {
    this.budgetLoading = true;
    const id = Number(this.$route.params.id);

    if (!Utilities.isNumeric(id)) {
      this.errorMessage = 'Invalid budget id.';
      return;
    }

    this.budgetId = id;

    const budget = await budgetService.getBudget(id);

    this.budgetLoading = false;

    if (!budget) {
      this.errorMessage = `No budget found for id ${id}.`;
      return;
    }

    this.budget = budget;
  }
});
</script>
