<template>
  <v-container fluid>
    <v-row align="start">
      <v-col cols="1">
        <v-text-field label="Ticker" v-model="tickerStaging" hide-details="auto"></v-text-field>
      </v-col>
      <v-col>
        <v-btn color="success" @click="addInvestment(tickerStaging)">Add Investment</v-btn>
      </v-col>
    </v-row>

    <v-row align="start">
      <v-col cols="1">
        <v-text-field
          @input="updateAllocations()"
          label="Allocation"
          v-model="allocation"
          type="number"
          hide-details="auto"
        ></v-text-field>
      </v-col>
    </v-row>

    <v-simple-table>
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">Ticker</th>
            <th class="text-left">Allocation Percentage ({{ remainingPercentage }}% Remaining)</th>
            <th class="text-left">Amount</th>
            <th class="text-center">Remove</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in investments" :key="item.tickerSymbol">
            <td>{{ item.tickerSymbol }}</td>
            <td>
              <v-text-field v-model="item.allocation" type="number" @input="adjustAllocation(item)"></v-text-field>
            </td>
            <td>${{ item.amount }}</td>
            <td class="text-center">
              <v-btn @click="removeInvestment(item)" color="error"><v-icon dark> mdi-close </v-icon></v-btn>
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';

export interface Investment {
  tickerSymbol: string;
  allocation: number;
  amount: number;
}

export default Vue.extend({
  name: 'Home',

  data: () => ({
    tickerStaging: null as string | null,
    errorMessage: null as string | null,
    remainingPercentage: 100,
    allocation: 0,
    budget: 0,
    investments: [] as Investment[]
  }),

  methods: {
    async addInvestment(tickerSymbol: string | null): Promise<void> {
      const normalizedTicker = tickerSymbol?.toUpperCase() || '';

      if (!tickerSymbol) {
        return;
      }

      if (this.investments.find(inv => inv.tickerSymbol === normalizedTicker)) {
        this.errorMessage = `You already have ${normalizedTicker} in your plan!`;
        return;
      }

      this.investments.push({ tickerSymbol: normalizedTicker, allocation: 0, amount: 0 });
    },

    adjustAllocation(investment: Investment): void {
      const { allocation } = investment;

      if (allocation > 100) {
        this.errorMessage = 'Allocations cannot be greater than 100 percent!';
        investment.allocation = 0;
        console.log(this.errorMessage);
        return;
      }

      if (allocation > this.remainingPercentage) {
        this.errorMessage = 'You do not have enough remain percentage to do that!';
        investment.allocation = 0;
        console.log(this.errorMessage);
        return;
      }

      investment.allocation = Number(Number(allocation).toFixed(2));

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
    }
  }
});
</script>
