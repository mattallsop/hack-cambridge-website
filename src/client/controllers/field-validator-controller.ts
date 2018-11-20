import { Controller } from 'stimulus'

export default class FieldValidatorController extends Controller {
  /**
   * Form fields
   */
  static targets = ['field']

  readonly fieldTarget!: HTMLSelectElement
  readonly fieldTargets!: HTMLSelectElement[]
  readonly hasFieldTargets!: boolean
  
  connect() {
    if (this.data.has('error')) {
      this.fieldTargets.forEach(element => {
        element.setCustomValidity(this.data.get('error'))
      })
    }
  }
  
  setValid(event) {
    this.fieldTargets.forEach(element => {
      element.setCustomValidity('')
    })
    this.data.delete('error')
  }
}
