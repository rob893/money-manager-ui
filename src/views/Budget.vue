<template>
  <div>
    <h1>{{ budget.name }}</h1>
    <v-alert v-model="showErrorMessage" type="error" dismissible>{{ errorMessage }}</v-alert>
    <v-data-table
      :headers="incomeTable.headers"
      :items="budget.incomes"
      :items-per-page="5"
      class="elevation-1"
      :loading="budgetLoading"
      loading-text="Loading... Please wait"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Income</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-spacer></v-spacer>
          <v-dialog v-model="incomeTable.addIncomeDialog" persistent max-width="600px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" dark v-bind="attrs" v-on="on"> Add Income </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="headline">Add Income to {{ budget.name }}</span>
              </v-card-title>
              <v-card-text>
                <v-form ref="addIncomeForm" v-model="incomeTable.addIncomeFormValid">
                  <v-container>
                    <v-row>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          label="Name*"
                          :rules="incomeTable.nameRules"
                          v-model="incomeTable.incomeToAdd.name"
                          required
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          label="Annual Amount*"
                          :rules="incomeTable.amountRules"
                          v-model.number="incomeTable.incomeToAdd.amount"
                          type="number"
                          required
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12">
                        <v-textarea label="Description" v-model="incomeTable.incomeToAdd.description"></v-textarea>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-select
                          :items="incomeTypes"
                          label="Income Type*"
                          required
                          @change="value => (incomeTable.incomeToAdd.incomeType = value.replace(/ /g, ''))"
                        ></v-select>
                      </v-col>
                    </v-row>
                  </v-container>
                  <small>*indicates required field</small>
                </v-form>
              </v-card-text>

              <v-card-actions v-if="incomeTable.addIncomeDialogLoading">
                <v-progress-circular indeterminate color="primary" />
              </v-card-actions>

              <v-card-actions v-else>
                <v-spacer></v-spacer>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="
                    incomeTable.addIncomeDialog = false;
                    resetAddIncomeForm();
                  "
                >
                  Close
                </v-btn>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="addIncomeToBudget"
                  :disabled="!incomeTable.addIncomeFormValid"
                >
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

      <template v-slot:[`item.amount`]="{ item }"> ${{ item.amount.toFixed(2) }} </template>
      <template v-slot:[`item.incomeType`]="{ item }"> {{ splitAtUpperCase(item.incomeType) }} </template>

      <!-- <template v-slot:[`item.actions`]="{ item }">
        <v-icon small> mdi-delete </v-icon>
      </template> -->
    </v-data-table>

    <br />

    <v-data-table
      :headers="expensesTable.headers"
      :items="budget.expenses"
      :items-per-page="5"
      class="elevation-1"
      :loading="budgetLoading"
      loading-text="Loading... Please wait"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Expenses</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-spacer></v-spacer>
          <v-dialog v-model="expensesTable.addExpenseDialog" persistent max-width="600px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" dark v-bind="attrs" v-on="on"> Add Expense </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="headline">Add Expense to {{ budget.name }}</span>
              </v-card-title>
              <v-card-text>
                <v-form ref="addExpenseForm" v-model="expensesTable.addExpenseFormValid">
                  <v-container>
                    <v-row>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          label="Name*"
                          :rules="expensesTable.nameRules"
                          v-model="expensesTable.expenseToAdd.name"
                          required
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          label="Amount*"
                          :rules="expensesTable.amountRules"
                          v-model.number="expensesTable.expenseToAdd.amount"
                          type="number"
                          required
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12">
                        <v-textarea label="Description" v-model="expensesTable.expenseToAdd.description"></v-textarea>
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-select
                          :items="expenseFrequencyTypes"
                          label="Frequency*"
                          required
                          @change="value => (expensesTable.expenseToAdd.frequency = value.replace(/ /g, ''))"
                        ></v-select>
                      </v-col>
                    </v-row>
                  </v-container>
                  <small>*indicates required field</small>
                </v-form>
              </v-card-text>

              <v-card-actions v-if="expensesTable.addExpenseDialogLoading">
                <v-progress-circular indeterminate color="primary" />
              </v-card-actions>

              <v-card-actions v-else>
                <v-spacer></v-spacer>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="
                    expensesTable.addExpenseDialog = false;
                    resetAddExpenseForm();
                  "
                >
                  Close
                </v-btn>
                <v-btn
                  color="blue darken-1"
                  text
                  @click="addExpenseToBudget"
                  :disabled="!expensesTable.addExpenseFormValid"
                >
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

      <template v-slot:[`item.dailyCost`]="{ item }">
        ${{ calculateExpensePerTimeFrame(item).daily.toFixed(2) }}
      </template>

      <template v-slot:[`item.weeklyCost`]="{ item }">
        ${{ calculateExpensePerTimeFrame(item).weekly.toFixed(2) }}
      </template>

      <template v-slot:[`item.monthlyCost`]="{ item }">
        ${{ calculateExpensePerTimeFrame(item).monthly.toFixed(2) }}
      </template>

      <template v-slot:[`item.annualCost`]="{ item }">
        ${{ calculateExpensePerTimeFrame(item).annual.toFixed(2) }}
      </template>
      <template v-slot:[`item.frequency`]="{ item }"> {{ splitAtUpperCase(item.frequency) }} </template>

      <!-- <template v-slot:[`item.actions`]="{ item }">
        <v-icon small> mdi-delete </v-icon>
      </template> -->
    </v-data-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { DataTableHeader } from 'vuetify';
import { Budget, Expense, ExpenseFrequency, Income, IncomeType } from '@/models/entities';
import { Utilities } from '@/helpers/Utilities';
import { budgetService, userService, authService } from '@/services';
import { CreateExpenseForBudgetDto, CreateIncomeForBudgetDto } from '@/models/dtos';
import { ExpensePerTimeFrame } from '@/models';

export default Vue.extend({
  name: 'Budget',

  data: () => ({
    incomeTable: {
      addIncomeFormValid: false,
      addIncomeDialog: false,
      addIncomeDialogLoading: false,
      incomeToAdd: {} as CreateIncomeForBudgetDto,
      nameRules: [(name: string) => !!name || 'Name is required'],
      amountRules: [
        (amount: number) => !!amount || 'Amount is required',
        (amount: number) => amount > 0 || 'Amount must be greater than 0.'
      ],
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
      ] as (DataTableHeader<Income> & { value: [keyof Income] })[]
    },
    expensesTable: {
      addExpenseFormValid: false,
      addExpenseDialog: false,
      addExpenseDialogLoading: false,
      expenseToAdd: {} as CreateExpenseForBudgetDto,
      nameRules: [(name: string) => !!name || 'Name is required'],
      amountRules: [
        (amount: number) => !!amount || 'Amount is required',
        (amount: number) => amount > 0 || 'Amount must be greater than 0.'
      ],
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
          text: 'Frequency',
          value: 'frequency'
        },
        {
          text: 'Daily Cost',
          value: 'dailyCost'
        },
        {
          text: 'Weekly Cost',
          value: 'weeklyCost'
        },
        {
          text: 'Monthly Cost',
          value: 'monthlyCost'
        },
        {
          text: 'Annual Cost',
          value: 'annualCost'
        },
        {
          text: 'Actions',
          value: 'actions',
          sortable: false
        }
      ] as (DataTableHeader<Expense> & { value: [keyof Expense] })[]
    },
    incomeTypes: Object.values(IncomeType).map(Utilities.splitAtUpperCase),
    expenseFrequencyTypes: Object.values(ExpenseFrequency).map(Utilities.splitAtUpperCase),
    budgetLoading: false,
    budgetId: null as number | null,
    budget: {} as Budget,
    errorMessage: '',
    showErrorMessage: false
  }),

  methods: {
    async getBudget(): Promise<void> {
      const budget = await userService.getBudgetsForUser(this.userId || 0);
      console.log(budget);
    },

    showErrorMessageAlert(message: string): void {
      this.errorMessage = message;
      this.showErrorMessage = true;
    },

    closeErrorMessage(): void {
      this.errorMessage = '';
      this.showErrorMessage = false;
    },

    async addIncomeToBudget(): Promise<void> {
      const { incomeToAdd } = this.incomeTable;

      if (!incomeToAdd.name || !this.budgetId) {
        return;
      }

      this.incomeTable.addIncomeDialogLoading = true;

      try {
        const newIncome = await budgetService.addIncomeToBudget(this.budgetId, { ...incomeToAdd });
        this.budget.incomes.push(newIncome);
      } catch (error) {
        this.showErrorMessageAlert('Unable to add income to budget.');
      } finally {
        this.incomeTable.addIncomeDialogLoading = false;
        this.incomeTable.addIncomeDialog = false;
        this.resetAddIncomeForm();
      }
    },

    async addExpenseToBudget(): Promise<void> {
      const { expenseToAdd } = this.expensesTable;

      if (!expenseToAdd.name || !this.budgetId) {
        return;
      }

      this.expensesTable.addExpenseDialogLoading = true;

      try {
        const newExpense = await budgetService.addExpenseToBudget(this.budgetId, { ...expenseToAdd });
        this.budget.expenses.push(newExpense);
      } catch (error) {
        this.showErrorMessageAlert('Unable to add expense to budget.');
      } finally {
        this.expensesTable.addExpenseDialogLoading = false;
        this.expensesTable.addExpenseDialog = false;
        this.resetAddExpenseForm();
      }
    },

    resetAddIncomeForm(): void {
      (this.$refs.addIncomeForm as any).reset();
    },

    resetAddExpenseForm(): void {
      (this.$refs.addExpenseForm as any).reset();
    },

    splitAtUpperCase(str: string): string {
      return Utilities.splitAtUpperCase(str);
    },

    calculateExpensePerTimeFrame(expense: Expense | Expense[]): ExpensePerTimeFrame {
      return Utilities.calculateExpensePerTimeFrame(expense);
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
