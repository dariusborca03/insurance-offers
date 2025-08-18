<script setup>
import { useOfferStore } from '@/service/offerStore';
import { onMounted, ref } from 'vue';
import SelectorComponent from '../form_inputs/SelectorComponent.vue';
import { ServiceAPI } from '@/service/apiService';
import LoadingComponent from '../LoadingComponent.vue';
import { useFormStore } from '@/service/formStore';

const paymentMethod = ref('');
let currentDate = null;
const currency = 'RON';
const amount = ref('');
const policyHolderResidency = ref('');
const policyHolderPolitical = ref('');
const ownerResidency = ref('');
const ownerPolitical = ref('');
const formStore = useFormStore();

const offerStore = useOfferStore();

const isLoadingPolicy = ref(false);

const pdfPolicyUrl = ref(null);

const getPolicy = async () => {
  isLoadingPolicy.value = true;
  try {
    const formStore = useFormStore();
    const policyholderEmail = formStore.personPolicyholderValues.email || '';

    const request = {
      "offerId": offerStore.offerId,
      "payment": {
        "method": paymentMethod.value,
        "currency": currency,
        "amount": amount.value,
        "date": currentDate,
      },
      "additionalData": {
        "userEmail": policyholderEmail
      }
    }

    const response = await ServiceAPI.fetchPolicy(request);
    var url = 'data:application/pdf;base64,' + response.body[0].content;
    var blobUrl;
    fetch(url)
      .then(res => res.blob())
      .then(URL.createObjectURL)
      .then((ret) => { blobUrl = ret; return blobUrl; })
      .then((res) => pdfPolicyUrl.value = res);

  } catch (error) {
    console.error(error);
  } finally {
    isLoadingPolicy.value = false;
  }
}

const closePdf = () => {
  pdfPolicyUrl.value = "";
  URL.revokeObjectURL(pdfPolicyUrl.value);
}

onMounted(() => {
  currentDate = new Date().toISOString().slice(0, 10);
  amount.value = offerStore.amount;

  if (!formStore.personPolicyholderValues.email) {
    console.warn('No email found in policyholder data');
  }
})
</script>

<template>

  <div class="m-4">
    <div v-if="!pdfPolicyUrl"
         class="grid grid-cols-3 gap-3 bg-gradient-to-r from-slate-900/60 via-blue-950/50 to-slate-900/50 backdrop-blur-md rounded-2xl py-6 px-8 shadow-2xl border border-white/10">
      <div class="col-span-3">
        <SelectorComponent id="payment" labelData="Metoda de plata" :options="[
                    { label: 'Chitanta', value: 'receipt' },
                    { label: 'Chitanta broker', value: 'broker receipt' },
                    { label: 'Ordin de plata', value: 'payment order' },
                    { label: 'Ordin de plata broker', value: 'broker payment order' },
                    { label: 'Terminal POS', value: 'pos' }
                ]" v-model="paymentMethod" />
      </div>

      <div>
        <p class="text-white font-medium">Total de plata:</p>
        <p class="text-lg text-white">{{ amount }} {{ currency }}</p>
      </div>

      <div>
        <p class="text-white font-medium">Data generare:</p>
        <p class="text-lg text-white">{{ currentDate }}</p>
      </div>

      <!-- Asigurat -->
      <div class="col-span-3 grid grid-cols-2 gap-4 mt-2">
        <div>
          <p class="text-white font-semibold mb-1">Asigurat</p>
          <SelectorComponent id="policyholderResidency" labelData="Cetatenie" :options="[
                        { label: 'Cetatean Roman', value: 'resident in Romania' },
                        { label: 'Cetatean EU', value: 'resident outside Romania but within the EC' },
                        { label: 'Cetatean non-EU', value: 'resident outside the EC' }
                    ]" v-model="policyHolderResidency" />
          <SelectorComponent id="policyholderPolitical" labelData="Expus politic?" :options="[
                        { label: 'Nu', value: 'no' },
                        { label: 'Da', value: 'yes' },
                        { label: 'Functionar public', value: 'person with a public management function' }
                    ]" v-model="policyHolderPolitical" />
        </div>

        <div>
          <p class="text-white font-semibold mb-1">Proprietar</p>
          <SelectorComponent id="ownerResidency" labelData="Cetatenie" :options="[
                        { label: 'Cetatean Roman', value: 'resident in Romania' },
                        { label: 'Cetatean EU', value: 'resident outside Romania but within the EC' },
                        { label: 'Cetatean non-EU', value: 'resident outside the EC' }
                    ]" v-model="ownerResidency" />
          <SelectorComponent id="ownerPolitical" labelData="Expus politic?" :options="[
                        { label: 'Nu', value: 'no' },
                        { label: 'Da', value: 'yes' },
                        { label: 'Functionar public', value: 'person with a public management function' }
                    ]" v-model="ownerPolitical" />
        </div>
      </div>

      <div class="flex flex-row justify-center items-center col-span-3 mt-4">
        <button @click="getPolicy"
                class="rounded-3xl py-4 px-12 text-white text-xl bg-red-500 hover:bg-red-600 transition-colors duration-200">
          Vezi polita
        </button>
      </div>
    </div>
    <div v-if="pdfPolicyUrl || isLoadingPolicy"
         class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999]">

      <LoadingComponent v-if="isLoadingPolicy" label="Se incarca polita..."></LoadingComponent>
      <div v-if="pdfPolicyUrl"
           class="flex-col relative w-[80%] max-w-[1000px] h-[85%] flex items-center justify-center">
        <button @click="closePdf"
                class="absolute top-2 -right-12 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2"
               stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <iframe :src="pdfPolicyUrl" frameborder="0" class="w-full h-full rounded-md"></iframe>
      </div>
    </div>

  </div>

</template>
