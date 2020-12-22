<template>
  <div>
    <h1>{{ budget.name }}</h1>

    <v-alert v-model="showErrorMessage" type="error" dismissible>{{ errorMessage }}</v-alert>

    <v-data-table
      :headers="summaryTable.headers"
      :items="summary"
      disable-pagination
      disable-sort
      disable-filtering
      :hide-default-footer="true"
      class="elevation-1"
      :loading="budgetLoading"
      loading-text="Loading... Please wait"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Summary</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
        </v-toolbar>
      </template>

      <template v-slot:[`item.daily`]="{ item }">
        {{ formatCurrency(item.daily) }}
      </template>

      <template v-slot:[`item.weekly`]="{ item }">
        {{ formatCurrency(item.weekly) }}
      </template>

      <template v-slot:[`item.monthly`]="{ item }">
        {{ formatCurrency(item.monthly) }}
      </template>

      <template v-slot:[`item.annual`]="{ item }">
        {{ formatCurrency(item.annual) }}
      </template>
    </v-data-table>

    <br />

    <v-data-table
      :headers="incomeTable.headers"
      :search="incomeTable.search"
      :items="budget.incomes"
      class="elevation-1"
      :loading="budgetLoading"
      loading-text="Loading... Please wait"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Income</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-text-field
            v-model="incomeTable.search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
          />
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

          <v-dialog v-model="incomeTable.showDeleteDialog" max-width="500px">
            <v-card>
              <v-card-title class="headline">Are you sure you want to delete this item?</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDeleteIncomeDialog">Cancel</v-btn>
                <v-btn color="blue darken-1" text @click="confirmDeleteStagedIncome">OK</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>

      <template v-slot:[`item.amount`]="{ item }"> {{ formatCurrency(item.amount) }} </template>
      <template v-slot:[`item.incomeType`]="{ item }"> {{ splitAtUpperCase(item.incomeType) }} </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-icon small @click="stageIncomeForDelete(item)"> mdi-delete </v-icon>
      </template>
    </v-data-table>

    <br />

    <v-data-table
      :headers="expensesTable.headers"
      :search="expensesTable.search"
      :items="budget.expenses"
      class="elevation-1"
      :loading="budgetLoading"
      loading-text="Loading... Please wait"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Expenses</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-text-field
            v-model="expensesTable.search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
          />
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

          <v-dialog v-model="expensesTable.showDeleteDialog" max-width="500px">
            <v-card>
              <v-card-title class="headline">Are you sure you want to delete this item?</v-card-title>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="closeDeleteExpenseDialog">Cancel</v-btn>
                <v-btn color="blue darken-1" text @click="confirmDeleteStagedExpense">OK</v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>

      <template v-slot:[`item.dailyCost`]="{ item }">
        {{ formatCurrency(calculateExpensePerTimeFrame(item).daily) }}
      </template>

      <template v-slot:[`item.weeklyCost`]="{ item }">
        {{ formatCurrency(calculateExpensePerTimeFrame(item).weekly) }}
      </template>

      <template v-slot:[`item.monthlyCost`]="{ item }">
        {{ formatCurrency(calculateExpensePerTimeFrame(item).monthly) }}
      </template>

      <template v-slot:[`item.annualCost`]="{ item }">
        {{ formatCurrency(calculateExpensePerTimeFrame(item).annual) }}
      </template>
      <template v-slot:[`item.frequency`]="{ item }"> {{ splitAtUpperCase(item.frequency) }} </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-icon small @click="stageExpenseForDelete(item)"> mdi-delete </v-icon>
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { DataTableHeader } from 'vuetify';
import { Budget, Expense, ExpenseFrequency, Income, IncomeType } from '@/models/entities';
import { Utilities } from '@/helpers/Utilities';
import { budgetService, userService, authService, expenseService, incomeService } from '@/services';
import { CreateExpenseForBudgetDto, CreateIncomeForBudgetDto } from '@/models/dtos';
import { AmountPerTimeFrame } from '@/models';

export default Vue.extend({
  name: 'Budget',

  data: () => ({
    summaryTable: {
      headers: [
        {
          text: 'Name',
          value: 'name',
          sortable: false
        },
        {
          text: 'Daily',
          value: 'daily',
          sortable: false
        },
        {
          text: 'Weekly',
          value: 'weekly',
          sortable: false
        },
        {
          text: 'Monthly',
          value: 'monthly',
          sortable: false
        },
        {
          text: 'Annual',
          value: 'annual',
          sortable: false
        }
      ] as DataTableHeader[]
    },
    incomeTable: {
      addIncomeFormValid: false,
      addIncomeDialog: false,
      addIncomeDialogLoading: false,
      showDeleteDialog: false,
      search: '',
      stagedIncomeForDelete: null as Income | null,
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
      ] as DataTableHeader[]
    },
    expensesTable: {
      addExpenseFormValid: false,
      addExpenseDialog: false,
      addExpenseDialogLoading: false,
      showDeleteDialog: false,
      stagedExpenseForDelete: null as Expense | null,
      expenseToAdd: {} as CreateExpenseForBudgetDto,
      search: '',
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
          value: 'frequency',
          sort: (a: ExpenseFrequency, b: ExpenseFrequency) =>
            Utilities.getFrequencyNumericValue(a) - Utilities.getFrequencyNumericValue(b)
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
      ] as DataTableHeader[]
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

    stageExpenseForDelete(expense: Expense): void {
      this.expensesTable.stagedExpenseForDelete = expense;
      this.expensesTable.showDeleteDialog = true;
    },

    async confirmDeleteStagedExpense(): Promise<void> {
      const { stagedExpenseForDelete } = this.expensesTable;

      if (!stagedExpenseForDelete) {
        this.showErrorMessageAlert('There is no staged expense to delete.');
        this.closeDeleteExpenseDialog();
        return;
      }

      try {
        await expenseService.deleteExpense(stagedExpenseForDelete.id);
        Utilities.removeItemFromArray(this.budget.expenses, stagedExpenseForDelete);
      } catch {
        this.showErrorMessageAlert('Unable to delete expense.');
      } finally {
        this.closeDeleteExpenseDialog();
      }
    },

    closeDeleteExpenseDialog(): void {
      this.expensesTable.stagedExpenseForDelete = null;
      this.expensesTable.showDeleteDialog = false;
    },

    stageIncomeForDelete(income: Income): void {
      this.incomeTable.stagedIncomeForDelete = income;
      this.incomeTable.showDeleteDialog = true;
    },

    async confirmDeleteStagedIncome(): Promise<void> {
      const { stagedIncomeForDelete } = this.incomeTable;

      if (!stagedIncomeForDelete) {
        this.showErrorMessageAlert('There is no staged income to delete.');
        this.closeDeleteIncomeDialog();
        return;
      }

      try {
        await incomeService.deleteIncome(stagedIncomeForDelete.id);
        Utilities.removeItemFromArray(this.budget.incomes, stagedIncomeForDelete);
      } catch {
        this.showErrorMessageAlert('Unable to delete income.');
      } finally {
        this.closeDeleteIncomeDialog();
      }
    },

    closeDeleteIncomeDialog(): void {
      this.incomeTable.stagedIncomeForDelete = null;
      this.incomeTable.showDeleteDialog = false;
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

    calculateExpensePerTimeFrame(expense: Expense | Expense[]): AmountPerTimeFrame {
      return Utilities.calculateExpensePerTimeFrame(expense);
    },

    formatCurrency(amount: number): string {
      return Utilities.formatCurrency(amount);
    }
  },

  computed: {
    userId(): number | null {
      return authService.loggedInUser?.id || null;
    },

    summary(): (AmountPerTimeFrame & { name: string })[] {
      if (!this.budget.expenses) {
        return [];
      }

      const incomeSummary = this.budget.incomes
        .map<AmountPerTimeFrame>(({ amount: annual }) => ({
          annual,
          monthly: annual / 12,
          biWeekly: annual / 26,
          weekly: annual / 52,
          daily: annual / 365
        }))
        .reduce(
          (prev, curr) => ({
            annual: prev.annual + curr.annual,
            monthly: prev.monthly + curr.monthly,
            biWeekly: prev.biWeekly + curr.biWeekly,
            weekly: prev.weekly + curr.weekly,
            daily: prev.daily + curr.daily
          }),
          { annual: 0, monthly: 0, biWeekly: 0, weekly: 0, daily: 0 }
        );

      const expenseSummary = Utilities.calculateExpensePerTimeFrame(this.budget.expenses);

      return [
        {
          name: 'Total Income',
          ...incomeSummary
        },
        {
          name: 'Total Expenses',
          ...expenseSummary
        },
        {
          name: 'Remaining Budget',
          annual: incomeSummary.annual - expenseSummary.annual,
          monthly: incomeSummary.monthly - expenseSummary.monthly,
          biWeekly: incomeSummary.biWeekly - expenseSummary.biWeekly,
          weekly: incomeSummary.weekly - expenseSummary.weekly,
          daily: incomeSummary.daily - expenseSummary.daily
        }
      ];
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
