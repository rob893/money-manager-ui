<template>
  <v-container fluid>
    <v-text-field label="Ticker" v-model="tickerStaging" hide-details="auto"></v-text-field>
    <v-btn color="success" @click="addInvestment(tickerStaging)">Add Investment</v-btn>
    <v-simple-table>
      <template v-slot:default>
        <thead>
          <tr>
            <th class="text-left">Ticker</th>
            <th class="text-left">Allocation</th>
            <th class="text-left">Amount</th>
            <th class="text-left">Remove</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in investments" :key="item.tickerSymbol">
            <td>{{ item.tickerSymbol }}</td>
            <td>
              <v-text-field label="allocation" hide-details="auto">{{ item.allocation }}%</v-text-field>
            </td>
            <td>${{ item.amount }}</td>
            <td @click="removeInvestment(item)">X</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

export interface Investment {
  tickerSymbol: string;
  allocation: number;
  amount: number;
}

@Component
export default class Home extends Vue {
  private tickerStaging: string | null = null;
  private errorMessage: string | null = null;
  private budget = 0;
  private investments: Investment[] = [];

  private addInvestment(tickerSymbol: string | null): void {
    //debugger;
    if (!tickerSymbol) {
      return;
    }

    this.investments.push({ tickerSymbol, allocation: 0, amount: 0 });
  }

  private adjustAllocation(investment: Investment, allocation: number): void {
    if (allocation > 100) {
      this.errorMessage = 'Allocations cannot be greater than 100 percent';
      return;
    }

    investment.allocation = allocation;

    const totalAllocation = this.investments.reduce((prev, curr) => prev + curr.allocation, 0);

    if (totalAllocation > 100) {
      this.errorMessage = 'You have allocated more than 100%!';
    }
  }

  private removeInvestment(investment: Investment): void {
    this.investments = this.investments.filter(invest => invest !== investment);
  }
}
</script>
