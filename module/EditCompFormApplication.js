export default class EditCompFormApplication extends FormApplication {
    constructor(actor, famille, familleComp) {
      super();
      this.actor = actor;
      this.famille = famille;
      this.familleComp = familleComp;
    }
  
    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        classes: ['form'],
        popOut: true,
        template: "systems/agone/templates/application/edit-comp-form-app.hbs",
        id: "edit-comp-app",
        title: "Edition des compétences",
        height: 500,
        width: 600,
        resizable: true
      });
    }
  
    getData() {
      // Send data to the template
      return {
        famille: this.familleComp,
        configData: CONFIG.agone
      };
    }
  
    activateListeners(html) {
      super.activateListeners(html);
    }
  
    async _updateObject(event, formData) {
        this.render();

        for (const [key, value] of Object.entries(formData)) { 
           let splitArray = key.split('.');
          if(splitArray[1] == "domaines") {
            if(value != "aucun") {
              this.familleComp.competences[splitArray[0]].domaines[splitArray[2]][splitArray[3]] = value;
            }
          } 
          else {
            if(value != "aucun") {
              this.familleComp.competences[splitArray[0]][splitArray[1]] = value;
            }
          } 
        }

        this.actor.updateFamilleComps(this.famille, this.familleComp);
    }
  }
  
  window.EditCompFormApplication = EditCompFormApplication;