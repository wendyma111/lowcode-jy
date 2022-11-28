import Project from "model/project"
import Dragon from "./dragon"
import Logic from './logic'

class Designer {
  logic!: Logic

  dragon = new Dragon()

  constructor(project: Project) {
    this.logic = new Logic(project)
  }

}

export default Designer