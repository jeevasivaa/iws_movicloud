/**
 * Mock Authentication Service
 * Simulates async API calls for login and signup.
 */

const MOCK_USER = {
  id: 1,
  name: 'John Doe',
  email: 'john.doe@vsabeverages.com',
  role: 'Executive Director',
}

/**
 * Simulates a login request.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} Resolves with user data on success
 */
export const login = (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email && password) {
        resolve({ success: true, user: { ...MOCK_USER, email } })
      } else {
        reject({ success: false, message: 'Invalid credentials' })
      }
    }, 500)
  })
}

/**
 * Simulates a signup request.
 * @param {object} data - { email, password, companyName }
 * @returns {Promise<object>} Resolves with success status
 */
export const signup = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Account created successfully', user: { ...MOCK_USER, email: data.email } })
    }, 500)
  })
}
