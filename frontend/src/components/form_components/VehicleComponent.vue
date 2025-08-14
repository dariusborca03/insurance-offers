<script setup>
import { ref, watch } from 'vue';
import InputComponent from '../form_inputs/InputComponent.vue';
import SelectorComponent from '../form_inputs/SelectorComponent.vue';
import { Service } from '@/service/service';
import { ValidationService } from '@/service/validationService';
import RadioComponent from '../form_inputs/RadioComponent.vue';
import { ServiceAPI } from '@/service/apiService';
import FileUploadComponent from '../form_inputs/FileUploadComponent.vue';

const props = defineProps({
  initialValues: Object,
});

const inputRefs = ref([]);

const setInputRef = (el, index) => {
  if (el) {
    inputRefs.value[index] = el;
  }
};

const driverLastName = ref("numexx");
const driverFirstName = ref("numexx");
const driverTaxId = ref("1940928205567");
const driverIdentif = ref("RD979672");
const driverMobileNumber = ref("0717504092");

const licensePlate = ref("B18SCL");
const registrationType = ref("registered");
const vin = ref("WVGZZZ5NZKW832294");
const vehicleType = ref("M1");
const brand = ref("vw");
const model = ref("tiguan");
const year = ref("2018");
const displacement = ref("1968");
const power = ref("110");
const weight = ref("2310");
const seats = ref("5");
const fuelType = ref("diesel");
const firstReg = ref("2018-01-01");
const ptiExpiryDate = ref("2025-11-12");
const usage = ref("personal");
const vehicleCIV = ref("N432594");
const currentMileage = ref("123012");
const carForDisabled = ref(false);
const isLeased = ref(false);
const registrationDocument = ref(null);


const isProcessingDocument = ref(false);

const errorPTI = ref('');
const errorTaxId = ref('');
const errorPhone = ref('');
const errorLicensePlate = ref('');
const errorDisplacement = ref('');
const errorPower = ref('');
const errorSeats = ref('');
const errorFuelType = ref('');
const errorRegistrationDocument = ref('');

watch(driverMobileNumber, (changedMobileNumber) => {
  if (changedMobileNumber === "") {
    errorPhone.value = "Camp necesar";
    return;
  }
  const result = ValidationService.validatePhoneNumber(changedMobileNumber);
  errorPhone.value = result.message;

});

watch(driverTaxId, (changedTaxId) => {
  const result = ValidationService.validateCNP(changedTaxId);
  errorTaxId.value = result.message;
});

watch(ptiExpiryDate, (newPtiExpiryDate) => {
  if (ValidationService.validateDateAfterToday(newPtiExpiryDate)) {
    errorPTI.value = "OK";
  } else {
    errorPTI.value = "ITP expirat"
  }
});

const triggerValidation = () => {
  inputRefs.value.forEach(inputRef => {
    if (inputRef && inputRef.triggerValidation) {
      inputRef.triggerValidation();
    }
  });
};

const validate = () => {
  triggerValidation();
  const isRegistered = ['registered', 'temporaryRegistered'].includes(registrationType.value);
  const isElectric = fuelType.value === 'electric';
  const isTrailer = /^O[1-4]$/i.test(vehicleType.value);
  let isValid = true;
  errorLicensePlate.value = '';
  errorDisplacement.value = '';
  errorPower.value = '';
  errorSeats.value = '';
  errorFuelType.value = '';
  errorRegistrationDocument.value = '';
  if (!driverLastName.value) isValid = false;
  if (!driverFirstName.value) isValid = false;
  if (!driverIdentif.value || errorTaxId.value !== '') isValid = false;
  if (!driverMobileNumber.value || (errorPhone.value !== '' && errorPhone.value !== 'OK')) isValid = false;
  if (!registrationType.value) isValid = false;
  if (isRegistered && !licensePlate.value) {
    errorLicensePlate.value = 'Camp necesar pentru vehicule inmatriculate';
    isValid = false;
  }
  if (!vin.value) isValid = false;
  if (!vehicleType.value) isValid = false;
  if (!brand.value) isValid = false;
  if (!model.value) isValid = false;
  if (!year.value) isValid = false;
  if (!weight.value) isValid = false;
  if (!usage.value) isValid = false;
  if (!vehicleCIV.value) isValid = false;
  if (!currentMileage.value) isValid = false;
  if (!driverTaxId.value) isValid = false;
  if (!isTrailer && !isElectric && !displacement.value) {
    errorDisplacement.value = 'Camp necesar pentru vehicule non-electrice';
    isValid = false;
  }
  if (!isTrailer) {
    if (!power.value) {
      errorPower.value = 'Camp necesar pentru vehicule non-remorca';
      isValid = false;
    }
    if (!seats.value) {
      errorSeats.value = 'Camp necesar pentru vehicule non-remorca';
      isValid = false;
    }
    if (!fuelType.value) {
      errorFuelType.value = 'Camp necesar pentru vehicule non-remorca';
      isValid = false;
    }
  }
  return isValid;
};

const setValues = (data) => {
  if (!data) return;
  const driverData = data.driver?.[0] || {};
  driverLastName.value = driverData.lastName || '';
  driverFirstName.value = driverData.firstName || '';
  driverTaxId.value = driverData.taxId || '';
  driverIdentif.value = driverData.identification?.idNumber || '';
  driverMobileNumber.value = driverData.mobileNumber || '';
  licensePlate.value = data.licensePlate || '';
  registrationType.value = data.registrationType || '';
  vin.value = data.vin || '';
  vehicleType.value = data.vehicleType || '';
  brand.value = data.brand || '';
  model.value = data.model || '';
  year.value = data.yearOfConstruction || '';
  displacement.value = data.engineDisplacement || '';
  power.value = data.enginePower || '';
  weight.value = data.totalWeight || '';
  seats.value = data.seats || '';
  fuelType.value = data.fuelType || '';
  firstReg.value = data.firstRegistration || '';
  usage.value = data.usageType || '';
  vehicleCIV.value = data.identification?.idNumber || '';
  currentMileage.value = data.currentMileage || '';
  carForDisabled.value = data.hasMobilityModifications || false;
  isLeased.value = data.isLeased || false;
};

watch(() => props.initialValues, (newVal) => {
  if (newVal) setValues(newVal);
}, { immediate: true });

const getValues = () => {
  return {
    driver: [{
      lastName: driverLastName.value,
      firstName: driverFirstName.value,
      taxId: driverTaxId.value,
      identification: {
        idNumber: driverIdentif.value
      },
      mobileNumber: driverMobileNumber.value
    }],
    licensePlate: licensePlate.value,
    registrationType: registrationType.value,
    vin: vin.value,
    vehicleType: vehicleType.value,
    brand: brand.value,
    model: model.value,
    yearOfConstruction: year.value,
    engineDisplacement: displacement.value,
    enginePower: power.value,
    totalWeight: weight.value,
    seats: seats.value,
    fuelType: fuelType.value,
    firstRegistration: firstReg.value,
    usageType: usage.value,
    identification: {
      idNumber: vehicleCIV.value,
    },
    currentMileage: currentMileage.value,
    hasMobilityModifications: carForDisabled.value,
    isLeased: isLeased.value,
    registrationDocument: registrationDocument.value
  }
};

const handleLicensePlateBlur = async () => {
  let jsonToSend = {
    "licensePlate": licensePlate.value
  }
  try {
    const data = await ServiceAPI.fetchDataForVehicle(jsonToSend);
    setValues(data);
  } catch (error) {
    return;
  }
};

const getPTI = () => {
  return { expirationDatePti: ptiExpiryDate.value };
}

const handleRegistrationDocumentUpload = async (file) => {
  if (!file) return;

  isProcessingDocument.value = true;
  errorRegistrationDocument.value = '';

  try {
    const ocrResult = await ServiceAPI.processRegistrationDocument(file);

    if (ocrResult) {
      if (ocrResult.numarInmatriculare) licensePlate.value = ocrResult.numarInmatriculare;
      if (ocrResult.serieSasiu) vin.value = ocrResult.serieSasiu;
      if (ocrResult.marca) brand.value = ocrResult.marca;
      if (ocrResult.model) model.value = ocrResult.model;
      if (ocrResult.anFabricatie) year.value = ocrResult.anFabricatie;
      if (ocrResult.capacitateCilindrica) displacement.value = ocrResult.capacitateCilindrica;
      if (ocrResult.putere) power.value = ocrResult.putere;
      if (ocrResult.masaMaxima) weight.value = ocrResult.masaMaxima;
      if (ocrResult.numarLocuri) seats.value = ocrResult.numarLocuri;
      if (ocrResult.serieCiv) vehicleCIV.value = ocrResult.serieCiv;

      alert('Câmpurile au fost auto-completate. Vă rugăm să verificați corectitudinea datelor.');
    }

  } catch (error) {
    console.error('Eroare la procesarea documentului:', error);
    errorRegistrationDocument.value = 'Eroare la încărcarea sau procesarea documentului.';
  } finally {
    isProcessingDocument.value = false;
  }
};

defineExpose({
  getValues,
  getPTI,
  validate
});
</script>

<template>
  <div class="my-4">
    <div class="mb-6">
      <h5 class="text-xl font-semibold text-white font-jura tracking-tighter">Incarca talon (optional)</h5>
      <hr class="mt-2 border-gray-200 mb-2">
      <div class="gap-4">
        <FileUploadComponent
          :ref="(el) => setInputRef(el, 21)"
          id="registrationDocument"
          labelData=""
          v-model="registrationDocument"
          :errorMessage="errorRegistrationDocument"
          :dark="true"
          accept="image/*"
          :maxSize="10 * 1024 * 1024"
          infoMessage="Incarcati o imagine cu talonul pentru a completa automat campurile vehiculului."
          @fileSelected="handleRegistrationDocumentUpload" />
        <div v-if="isProcessingDocument" class="text-white mt-2 animate-pulse">
          Se procesează imaginea... ⏳
        </div>
      </div>
    </div>

    <h5 class="text-xl font-semibold text-white font-jura tracking-tighter">Informatii sofer</h5>
    <hr class="mt-2 border-gray-200 mb-4">

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-x-4">
      <InputComponent :ref="(el) => setInputRef(el, 0)" class="col-span-1" id="driverLastName" labelData="Nume"
                      type="text" v-model="driverLastName" :dark="true"
                      :errorMessage="driverLastName === '' ? 'Camp necesar' : ''">
      </InputComponent>
      <InputComponent :ref="(el) => setInputRef(el, 1)" class="col-span-1" id="driverFirstName"
                      labelData="Prenume" type="text" v-model="driverFirstName" :dark="true"
                      :errorMessage="driverFirstName === '' ? 'Camp necesar' : ''">
      </InputComponent>
      <InputComponent :ref="(el) => setInputRef(el, 2)" class="col-span-1" id="driverTaxId" labelData="CNP"
                      type="text" v-model="driverTaxId" :dark="true" :errorMessage="errorTaxId">
      </InputComponent>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-4 gap-x-4">
      <div></div>
      <InputComponent :ref="(el) => setInputRef(el, 3)" id="driverIdentif" labelData="Serie / numar" type="text"
                      v-model="driverIdentif" :dark="true" :errorMessage="driverIdentif === '' ? 'Camp necesar' : ''">
      </InputComponent>
      <InputComponent :ref="(el) => setInputRef(el, 4)" id="driverMobileNumber" labelData="Telefon" type="text"
                      v-model="driverMobileNumber" :dark="true"
                      :errorMessage="(errorPhone !== '' && errorPhone !== 'OK') ? errorPhone.valueOf() : ''">
      </InputComponent>
      <div></div>
    </div>

    <h5 class="text-xl font-semibold text-white font-jura tracking-tighter">Informatii vehicul</h5>
    <hr class="mt-2 mb-4">
    <div class="grid grid-cols-2 gap-x-4">
      <InputComponent :ref="(el) => setInputRef(el, 5)" id="licensePlate" labelData="Nr Inmatriculare" type="text"
                      v-model="licensePlate" :dark="true" :errorMessage="errorLicensePlate" @blur="handleLicensePlateBlur">
      </InputComponent>
      <SelectorComponent :ref="(el) => setInputRef(el, 6)" id="registrationType" labelData="Status"
                         :options="Service.getRegistrationTypes()" v-model="registrationType"
                         :errorMessage="registrationType === '' ? 'Camp necesar' : ''" />
      <InputComponent :ref="(el) => setInputRef(el, 7)" id="vin" labelData="Sasiu" type="text" v-model="vin"
                      :dark="true" :errorMessage="vin === '' ? 'Camp necesar' : ''">
      </InputComponent>
      <SelectorComponent :ref="(el) => setInputRef(el, 8)" id="vehicleType" labelData="Tip"
                         :options="Service.getVehicleTypes()" v-model="vehicleType"
                         :errorMessage="vehicleType === '' ? 'Camp necesar' : ''" />
    </div>

    <div class="grid grid-cols-3 md:grid-cols-6 gap-x-4">
      <InputComponent :ref="(el) => setInputRef(el, 9)" id="brand" labelData="Brand" type="text" v-model="brand"
                      :dark="true" :errorMessage="brand === '' ? 'Camp necesar' : ''">
      </InputComponent>
      <InputComponent :ref="(el) => setInputRef(el, 10)" id="model" labelData="Model" type="text" v-model="model"
                      :dark="true" :errorMessage="model === '' ? 'Camp necesar' : ''">
      </InputComponent>
      <InputComponent :ref="(el) => setInputRef(el, 11)" id="year" labelData="An" type="number" v-model="year"
                      :dark="true" :errorMessage="year === '' ? 'Camp necesar' : ''">
      </InputComponent>
      <InputComponent :ref="(el) => setInputRef(el, 12)" id="displacement" labelData="Capacitate" type="number"
                      v-model="displacement" :dark="true" :errorMessage="errorDisplacement">
      </InputComponent>
      <InputComponent :ref="(el) => setInputRef(el, 13)" id="power" labelData="Putere" type="number"
                      v-model="power" :dark="true" :errorMessage="errorPower">
      </InputComponent>
      <InputComponent :ref="(el) => setInputRef(el, 14)" id="weight" labelData="MTA (kg)" type="number"
                      v-model="weight" :dark="true" :errorMessage="weight === '' ? 'Camp necesar' : ''">
      </InputComponent>
    </div>

    <div class="grid md:grid-cols-3 gap-x-4">
      <InputComponent class="col-span-1" :ref="(el) => setInputRef(el, 15)" id="seats" labelData="Locuri"
                      type="number" v-model="seats" :dark="true" :errorMessage="errorSeats">
      </InputComponent>
      <SelectorComponent class="col-span-1" :ref="(el) => setInputRef(el, 16)" id="fuelType"
                         labelData="Combustibil" :options="Service.getGasTypes()" v-model="fuelType"
                         :errorMessage="errorFuelType" />
      <InputComponent :ref="(el) => setInputRef(el, 17)" id="firstReg" labelData="Prima inreg." type="date"
                      v-model="firstReg" :dark="true" :errorMessage="firstReg === '' ? 'Camp necesar' : ''">
      </InputComponent>
      <InputComponent id="ptiExpiryDate" labelData="Expirare ITP" type="date" v-model="ptiExpiryDate" :dark="true"
                      :errorMessage="(errorPTI !== '' && errorPTI !== 'OK') ? errorPTI.valueOf() : ''"
                      :infoMessage="errorPTI === '' ? 'Camp necesar pentru unii asiguratori' : ''">
      </InputComponent>
      <SelectorComponent :ref="(el) => setInputRef(el, 18)" id="usage" labelData="Utilizare"
                         :options="Service.getUsageTypes()" v-model="usage" :errorMessage="usage === '' ? 'Camp necesar' : ''" />
      <InputComponent :ref="(el) => setInputRef(el, 19)" id="vehicleCIV" labelData="CIV" type="text"
                      v-model="vehicleCIV" :dark="true" :errorMessage="vehicleCIV === '' ? 'Camp necesar' : ''">
      </InputComponent>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-x-4">
      <div class="hidden md:block"></div>
      <InputComponent class="md:col-span-2" :ref="(el) => setInputRef(el, 20)" id="currentMileage"
                      labelData="Numar km" type="number" v-model="currentMileage" :dark="true"
                      :errorMessage="currentMileage === '' ? 'Camp necesar' : ''">
      </InputComponent>
      <div class="hidden md:block"></div>
      <div class="flex gap-2 items-center flex-1 col-span-2 md:justify-normal justify-center">
        <p class="font-medium text-lg text-gray-100/90 font-jura tracking-tighter">Modificari dizabilitati
        </p>
        <RadioComponent v-model="carForDisabled" :options="[
                    { label: 'Nu', value: false },
                    { label: 'Da', value: true }
                ]" :name="'disabled'" :dark="true" />
      </div>
      <div class="flex gap-2 items-center flex-1 col-span-2 md:justify-end justify-center">
        <p class="font-medium text-lg text-gray-100/90 font-jura tracking-tighter">Leased</p>
        <RadioComponent v-model="isLeased" :options="[
                    { label: 'Nu', value: false },
                    { label: 'Da', value: true }
                ]" :name="'leased'" :dark="true" />
      </div>
    </div>
  </div>
</template>
