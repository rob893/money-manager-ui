<template>
  <div>
    <h1>This budget page {{ budget.name }}</h1>
    <v-btn @click="getBudget">Click!</v-btn>
  </div>
</template>

<script lang="ts">
import { Budget } from '@/models/entities';
import { Utilities } from '@/helpers/Utilities';
import { budgetService } from '@/services/BudgetService';
import Vue from 'vue';

export default Vue.extend({
  name: 'Budget',

  data: () => ({
    budgetId: null as number | null,
    budget: {} as Budget,
    errorMessage: null as string | null
  }),

  methods: {
    async getBudget(): Promise<void> {
      const budget = await budgetService.getBudget(this.budgetId || 0);
      console.log(budget);
    }
  },

  async mounted(): Promise<void> {
    const id = Number(this.$route.params.id);

    if (!Utilities.isNumeric(id)) {
      this.errorMessage = 'Invalid budget id.';
      return;
    }

    this.budgetId = id;

    const budget = await budgetService.getBudget(id);

    if (!budget) {
      this.errorMessage = `No budget found for id ${id}.`;
      return;
    }

    this.budget = budget;
  }
});
</script>
