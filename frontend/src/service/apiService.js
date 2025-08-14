import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

const apiLogin = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
})

export class ServiceAPI {
  /**
   * Trimite imaginea talonului auto către backend pentru procesare OCR.
   * @param {File} file - Fișierul imagine selectat de utilizator.
   * @returns {Promise<object>} - Datele extrase din talon.
   */
  static async processRegistrationDocument(file) {
    try {
      const formData = new FormData()
      formData.append('document', file)

      const response = await api.post('/vehicles/process-registration-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      return response.data
    } catch (error) {
      console.error('Error processing document:', error)
      throw error // Aruncă eroarea mai departe pentru a fi prinsă în componenta Vue
    }
  }

  static async fetchNationalities() {
    try {
      const response = await api.get('/countries')
      return response.data.data || response.data
    } catch (error) {
      console.error('Error fetching countries:', error)
      return []
    }
  }

  static async fetchCounties() {
    try {
      const response = await api.get('/counties')
      return response.data.data || response.data
    } catch (error) {
      console.error('Error fetching counties:', error)
      return []
    }
  }

  static async fetchCities(city) {
    try {
      const response = await api.get(`/cities/${city}`)
      return response.data.data || response.data
    } catch (error) {
      console.error('Error fetching cities:', error)
      return []
    }
  }

  static async fetchOffers(product) {
    try {
      const response = await api.post('/offer', product)
      return response.data
    } catch (error) {
      console.error('Error fetching offers:', error)
      throw error
    }
  }

  static async fetchPolicy(request) {
    try {
      const response = await api.post('/policy', request)
      return response.data
    } catch (error) {
      console.error('Error fetching policy:', error)
      throw error
    }
  }

  static async fetchOfferPdf(offerId) {
    try {
      const response = await api.get(`/offer/${offerId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching offer PDF:', error)
      throw error
    }
  }

  static async fetchDataForPerson(jsonToSend) {
    try {
      const response = await api.post(`/person`, jsonToSend)
      return response.data
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  static async fetchDataForVehicle(jsonToSend) {
    try {
      const response = await api.post(`/vehicle`, jsonToSend)
      return response.data
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  static async fetchUserOffers(userData) {
    try {
      const response = await api.post('/user/offers', userData)
      return response.data
    } catch (error) {
      console.error('Error fetching user offers:', error)
      throw error
    }
  }
}

export default apiLogin
