import { Notify, Dialog } from 'quasar'

// Notificação rápida de sucesso
export function showSuccess(message) {
  Notify.create({
    message,
    color: 'positive',
    position: 'top',
    icon: 'check_circle',
    timeout: 3000
  })
}

// Notificação rápida de erro
export function showError(message) {
  Notify.create({
    message,
    color: 'negative',
    position: 'top',
    icon: 'error',
    timeout: 4000
  })
}

// Notificação informativa
export function showInfo(message) {
  Notify.create({
    message,
    color: 'info',
    position: 'top',
    icon: 'info',
    timeout: 3000
  })
}

// Popup modal de confirmação
export function showConfirm(title, message, onOk) {
  Dialog.create({
    title,
    message,
    cancel: true,
    ok: {
      label: 'Confirmar',
      color: 'primary'
    }
  }).onOk(() => {
    if (onOk) onOk()
  })
}

// Popup modal simples
export function showDialog(title, message) {
  Dialog.create({
    title,
    message,
    ok: {
      label: 'Fechar',
      color: 'primary'
    }
  })
}
