import { ref } from 'vue'
import type { PaymentIntent } from '@/types'

export function usePayment() {
  const isProcessing = ref(false)
  const error = ref<string | null>(null)
  const paymentIntent = ref<PaymentIntent | null>(null)

  // Clave pública de Stripe (reemplazar con tu clave real)
  const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_...'

  async function createPaymentIntent(amount: number, currency = 'eur') {
    isProcessing.value = true
    error.value = null

    try {
      // Simulación de llamada a tu backend para crear un PaymentIntent
      // En producción, esto debe llamar a tu API backend que usa Stripe
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, currency })
      })

      if (!response.ok) {
        throw new Error('Error al crear intención de pago')
      }

      const data = await response.json()
      paymentIntent.value = {
        id: data.id,
        amount,
        currency,
        status: 'pending'
      }

      return data.clientSecret
    } catch (e) {
      error.value = 'Error al procesar el pago'
      console.error(e)
      return null
    } finally {
      isProcessing.value = false
    }
  }

  async function confirmPayment(clientSecret: string, paymentMethod: any) {
    isProcessing.value = true
    error.value = null

    try {
      // Aquí integrarías Stripe.js para confirmar el pago
      // const stripe = await loadStripe(STRIPE_PUBLIC_KEY)
      // const result = await stripe.confirmCardPayment(clientSecret, { payment_method: paymentMethod })
      
      // Simulación por ahora
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (paymentIntent.value) {
        paymentIntent.value.status = 'succeeded'
      }

      return true
    } catch (e) {
      error.value = 'Error al confirmar el pago'
      if (paymentIntent.value) {
        paymentIntent.value.status = 'failed'
      }
      console.error(e)
      return false
    } finally {
      isProcessing.value = false
    }
  }

  function resetPayment() {
    paymentIntent.value = null
    error.value = null
    isProcessing.value = false
  }

  return {
    isProcessing,
    error,
    paymentIntent,
    createPaymentIntent,
    confirmPayment,
    resetPayment
  }
}
