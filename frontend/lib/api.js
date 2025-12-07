const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function requestOTP(email, name) {
  try {
    const response = await fetch(`${API_URL}/api/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });
    return await response.json();
  } catch (error) {
    console.error('Request OTP error:', error);
    return {
      success: false,
      message: 'Failed to request OTP: ' + error.message,
    };
  }
}

export async function verifyOTP(email, name, otp) {
  try {
    const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, otp }),
    });
    return await response.json();
  } catch (error) {
    console.error('Verify OTP error:', error);
    return {
      success: false,
      message: 'Failed to verify OTP: ' + error.message,
    };
  }
}

export async function validateSession(sessionId) {
  try {
    const response = await fetch(`${API_URL}/api/auth/validate-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    return await response.json();
  } catch (error) {
    console.error('Validate session error:', error);
    return {
      success: false,
      message: 'Failed to validate session: ' + error.message,
    };
  }
}

export async function logout(sessionId) {
  try {
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    return await response.json();
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      message: 'Failed to logout: ' + error.message,
    };
  }
}

export async function getRoomStats(roomId) {
  try {
    const response = await fetch(`${API_URL}/api/rooms/${roomId}/stats`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return await response.json();
  } catch (error) {
    console.error('Get room stats error:', error);
    return {
      success: false,
      data: null,
      message: 'Failed to get room stats: ' + error.message,
    };
  }
}

export async function getRoomMessages(roomId, limit = 50) {
  try {
    const response = await fetch(`${API_URL}/api/rooms/${roomId}/messages?limit=${limit}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return await response.json();
  } catch (error) {
    console.error('Get room messages error:', error);
    return {
      success: false,
      data: null,
      message: 'Failed to get room messages: ' + error.message,
    };
  }
}
