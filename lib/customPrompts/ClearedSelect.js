'use strict';

/* eslint no-void: 0 */
/* eslint consistent-return: 0 */

const { Select } = require('enquirer');
const utils = require('./../../node_modules/enquirer/lib/utils');

class ClearedSelect extends Select {
  async submit() {
    const choice = this.focused;
    if (!choice) return this.alert();

    if (choice.newChoice) {
      if (!choice.input) return this.alert();
      choice.updateChoice();

      return this.render();
    }

    if (this.choices.some((ch) => ch.newChoice)) {
      return this.alert();
    }

    const { reorder, sort } = this.options;
    const multi = this.multiple === true;
    let value = this.selected;
    if (value === void 0) {
      return this.alert();
    }

    // re-sort choices to original order
    if (Array.isArray(value) && reorder !== false && sort !== true) {
      value = utils.reorder(value);
    }

    this.value = multi ? value.map((ch) => ch.name) : value.name;

    this.state.submitted = true;
    this.state.validating = true;

    // this will only be called when the prompt is directly submitted
    // without initializing, i.e. when the prompt is skipped, etc. Otherwize,
    // "options.onSubmit" is will be handled by the "initialize()" method.
    if (this.options.onSubmit) {
      await this.options.onSubmit.call(this, this.name, this.value, this);
    }

    const result = this.state.error || await this.validate(this.value, this.state);
    if (result !== true) {
      let error = `\n${this.symbols.pointer} `;

      if (typeof result === 'string') {
        error += result.trim();
      } else {
        error += 'Invalid input';
      }

      this.state.error = `\n${this.styles.danger(error)}`;
      this.state.submitted = false;
      await this.render();
      await this.alert();
      this.state.validating = false;
      this.state.error = void 0;
      return;
    }

    this.state.validating = false;
    await this.render();

    // ADDITIONAL LINE
    // clear console before submit result
    await this.clear(0);
    // ADDITIONAL LINE

    await this.close();

    this.value = await this.result(this.value);
    this.emit('submit', this.value);
  }
}

module.exports = ClearedSelect;
