<template>
  <div>
    <v-alert v-model="showErrorMessage" type="error" dismissible>{{ errorMessage }}</v-alert>

    <v-data-table :headers="headers" :items="investments" class="elevation-1">
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Investment Allocator</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-text-field
            @input="updateAllocations()"
            label="Amount to Allocate"
            v-model="allocation"
            type="number"
            hide-details="auto"
            prepend-icon="mdi-currency-usd"
          />
          <v-spacer></v-spacer>
          <v-dialog v-model="addInvestmentDialog" persistent max-width="600px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="primary" dark v-bind="attrs" v-on="on">Add Investment</v-btn>
            </template>
            <v-card>
              <v-form
                ref="addInvestmentForm"
                v-model="addInvestmentFormValid"
                @submit.prevent="
                  addInvestment();
                  closeAddInvestmentDialog();
                "
              >
                <v-card-title>
                  <span class="headline">Add Investment</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          label="Ticker*"
                          v-model="stagedInvestment.tickerSymbol"
                          :rules="addInvestmentTickerRules"
                          required
                        />
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          label="Allocation*"
                          v-model.number="stagedInvestment.allocation"
                          type="number"
                          :rules="addInvestmentAllocationRules"
                          required
                        />
                      </v-col>
                    </v-row>
                  </v-container>
                  <small>*indicates required field</small>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="addInvestmentDialog = false">Close</v-btn>
                  <v-btn color="blue darken-1" text type="submit" :disabled="!addInvestmentFormValid">Add</v-btn>
                </v-card-actions>
              </v-form>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>

      <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length">
          Description:<br /><br />{{ item.description || `No description set for ${item.name}.` }}<br />
        </td>
      </template>

      <template v-slot:[`header.allocation`]="{ header }">
        {{ `${header.text} (${remainingPercentage}% Remaining)` }}
      </template>

      <template v-slot:[`item.allocation`]="{ item }">
        <v-edit-dialog :return-value.sync="item.allocation" @save="adjustAllocation(item)" large>
          {{ item.allocation }}%
          <template v-slot:input>
            <v-text-field
              v-model="item.allocation"
              :rules="addInvestmentAllocationRules"
              label="Edit"
              single-line
              counter
            ></v-text-field>
          </template>
        </v-edit-dialog>
      </template>

      <template v-slot:[`item.amount`]="{ item }">
        {{ formatCurrency(item.amount) }}
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-icon small @click="removeInvestment(item)"> mdi-delete </v-icon>
      </template>
    </v-data-table>
  </div>
</template>

<script lang="ts">
import { Utilities } from '@/helpers/Utilities';
import Vue from 'vue';
import { DataTableHeader } from 'vuetify';

export interface Investment {
  tickerSymbol: string;
  allocation: number;
  amount: number;
}

export default Vue.extend({
  name: 'InvestmentAllocator',

  data: () => ({
    addInvestmentDialog: false,
    headers: [
      {
        text: 'Ticker',
        value: 'tickerSymbol'
      },
      {
        text: 'Allocation Percentage',
        value: 'allocation'
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
    ] as DataTableHeader[],
    addInvestmentFormValid: false,
    errorMessage: null as string | null,
    showErrorMessage: false,
    remainingPercentage: 100,
    allocation: 0,
    budget: 0,
    stagedInvestment: {
      tickerSymbol: '',
      allocation: 0,
      amount: 0
    } as Investment,
    investments: [] as Investment[]
  }),

  methods: {
    addInvestment(): void {
      const { tickerSymbol, allocation } = this.stagedInvestment;

      const normalizedTicker = tickerSymbol?.toUpperCase() || '';

      const failedRules: string[] = [];

      for (const rule of this.addInvestmentTickerRules) {
        const result = rule(tickerSymbol);

        if (typeof result === 'string') {
          failedRules.push(result);
        }
      }

      for (const rule of this.addInvestmentAllocationRules) {
        const result = rule(allocation);

        if (typeof result === 'string') {
          failedRules.push(result);
        }
      }

      if (failedRules.length > 0) {
        this.showErrorMessageAlert(failedRules[0]);
        return;
      }

      this.investments.push({ tickerSymbol: normalizedTicker, allocation, amount: 0 });
      this.updateAllocations();
    },

    adjustAllocation(investment: Investment): void {
      const { allocation } = investment;

      if (allocation > this.remainingPercentage) {
        this.showErrorMessageAlert('You do not have enough remain percentage to do that!');
      }

      if (allocation > 100) {
        this.showErrorMessageAlert('Allocations cannot be greater than 100 percent!');
      }

      this.updateAllocations();
    },

    removeInvestment(investment: Investment): void {
      this.investments = this.investments.filter(invest => invest !== investment);
      this.updateAllocations();
    },

    updateAllocations(): void {
      this.allocation = Number(Number(this.allocation).toFixed(2));

      const totalAllocation = this.investments.reduce((prev, curr) => prev + curr.allocation, 0);

      this.remainingPercentage = 100 - totalAllocation;

      this.investments.forEach(investment => (investment.amount = this.allocation * (investment.allocation / 100)));
    },

    closeAddInvestmentDialog(): void {
      this.resetAddInvestmentForm();
      this.stagedInvestment = {
        tickerSymbol: '',
        allocation: 0,
        amount: 0
      };
      this.addInvestmentDialog = false;
    },

    showErrorMessageAlert(message: string): void {
      this.errorMessage = message;
      this.showErrorMessage = true;
    },

    formatCurrency(amount: number): string {
      return Utilities.formatCurrency(amount);
    },

    resetAddInvestmentForm(): void {
      (this.$refs.addInvestmentForm as any).reset();
    }
  },

  computed: {
    addInvestmentTickerRules(): ((name: string) => boolean | string)[] {
      return [
        (name: string) => !!name || 'Ticker symbol is required',
        (name: string) =>
          !this.investments.find(inv => inv.tickerSymbol.toUpperCase() === name.toUpperCase()) ||
          `You already have ${name.toUpperCase()} in your plan!`
      ];
    },

    addInvestmentAllocationRules(): ((amount: number) => boolean | string)[] {
      return [
        (amount: number) => (!!amount && amount > 0) || 'Amount greater than 0 is required.',
        (amount: number) => (!!amount && amount <= 100) || 'Amount must be less than or equal to 100.',
        (amount: number) =>
          (!!amount && this.remainingPercentage - amount >= 0) ||
          `You only have ${this.remainingPercentage}% left to allocate.`
      ];
    }
  }
});
</script>
