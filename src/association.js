export default class ReviewerAssociation {
  static None = new ReviewerAssociation('NONE')
  static FirstTimer = new ReviewerAssociation('FIRST_TIMER')
  static FirstTimeContributor = new ReviewerAssociation(
    'FIRST_TIME_CONTRIBUTOR'
  )
  static Contributor = new ReviewerAssociation('CONTRIBUTOR')
  static Collaborator = new ReviewerAssociation('COLLARBORATOR')
  static Member = new ReviewerAssociation('MEMBER')
  static Owner = new ReviewerAssociation('OWNER')

  constructor(string) {
    this.string = string

    switch (string) {
      case 'NONE':
        this.enumOrdinal = 0
        break
      case 'FIRST_TIMER':
        this.enumOrdinal = 1
        break
      case 'FIRST_TIME_CONTRIBUTOR':
        this.enumOrdinal = 2
        break
      case 'CONTRIBUTOR':
        this.enumOrdinal = 3
        break
      case 'COLLABORATOR':
        this.enumOrdinal = 4
        break
      case 'MEMBER':
        this.enumOrdinal = 5
        break
      case 'OWNER':
        this.enumOrdinal = 6
        break
      default:
        this.enumOrdinal = -1
    }
  }

  /**
   * Compares the given association
   * @param {ReviewerAssociation} lhs left hand side
   * @param {ReviewerAssociation} rhs right hand side
   * @returns {boolean} true if lhs is greater than or equal to rhs
   */
  static isGreaterOrEqual(lhs, rhs) {
    return lhs.enumOrdinal >= rhs.enumOrdinal
  }

  /**
   * Converts the given string to an enum element
   * @param {string} string the string to be converted to this enum
   * @returns {ReviewerAssociation} the enum object
   */
  static fromString(string) {
    switch (string) {
      case 'NONE':
        return this.None
      case 'FIRST_TIMER':
        return this.FirstTimer
      case 'FIRST_TIME_CONTRIBUTOR':
        return this.FirstTimeContributor
      case 'CONTRIBUTOR':
        return this.Contributor
      case 'COLLABORATOR':
        return this.Collaborator
      case 'MEMBER':
        return this.Member
      case 'OWNER':
        return this.Owner
      default:
        return ReviewerAssociation.Notfound
    }
  }
  toString() {
    return `ReviewerAssociation.${this.string}`
  }
}
