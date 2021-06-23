export default class EditCompFormApplication extends FormApplication {
    constructor(familleComp, configData) {
      super();
      this.familleComp = familleComp;
      this.configData = configData;
    }
  
    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        classes: ['form'],
        popOut: true,
        template: "systems/agone/templates/application/edit-comp-form-app.hbs",
        id: "edit-comp-app",
        title: "Formulaire d'édition des compétences",
        height: 500,
        width: 600,
        resizable: true
      });
    }
  
    getData() {
      // Send data to the template
      return {
        famille: this.familleComp,
        configData: this.configData,
      };
    }
  
    activateListeners(html) {
      super.activateListeners(html);
    }
  
    async _updateObject(event, formData) {
        this.render();
        console.log(formData);
    }
  }
  
  window.EditCompFormApplication = EditCompFormApplication;