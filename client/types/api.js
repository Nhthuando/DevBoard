/**
 * @typedef {'CLIENT' | 'DEV'} UserRole
 * @typedef {'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'} JobStatus
 * @typedef {'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'} ProposalStatus
 * @typedef {'ACTIVE' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED'} ContractStatus
 * @typedef {'PENDING' | 'ESCROWED' | 'RELEASED' | 'REFUNDED' | 'DISPUTED'} PaymentStatus
 * @typedef {'MANUAL' | 'AUTO'} ReleaseType
 * @typedef {'PROPOSAL_RECEIVED' | 'PROPOSAL_ACCEPTED' | 'PROPOSAL_REJECTED' | 'CONTRACT_CREATED' | 'PAYMENT_ESCROWED' | 'PAYMENT_RELEASED' | 'NEW_MESSAGE' | 'REVIEW_RECEIVED'} NotificationType
 */

/**
 * @typedef {Object} Pagination
 * @property {number} page
 * @property {number} limit
 * @property {number} totalItems
 * @property {number} totalPages
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {UserRole} role
 */

/**
 * @typedef {Object} Job
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string | number} budgetMin
 * @property {string | number} budgetMax
 * @property {string} deadline
 * @property {JobStatus} status
 * @property {string} clientId
 */

/**
 * @typedef {Object} Proposal
 * @property {string} id
 * @property {string} jobId
 * @property {string} devId
 * @property {string} coverLetter
 * @property {string | number} bidAmount
 * @property {ProposalStatus} status
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Contract
 * @property {string} id
 * @property {string} jobId
 * @property {string} proposalId
 * @property {string} clientId
 * @property {string} devId
 * @property {ContractStatus} status
 * @property {string | number} agreedAmount
 */

/**
 * @typedef {Object} Payment
 * @property {string} id
 * @property {string} contractId
 * @property {string | number} amount
 * @property {PaymentStatus} status
 * @property {ReleaseType=} releaseType
 */

/**
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} contractId
 * @property {number} rating
 * @property {string=} comment
 * @property {string} createdAt
 */

/**
 * @typedef {Object} Notification
 * @property {string} id
 * @property {NotificationType} type
 * @property {string} title
 * @property {string} body
 * @property {boolean} isRead
 * @property {string} createdAt
 */

export {}
