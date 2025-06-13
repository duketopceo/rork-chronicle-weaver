import { initializeAppCheck, getToken, ReCaptchaV3Provider } from "firebase/app-check";
import { getAuth } from "firebase/auth";
import { getApp } from "firebase/app";

// Initialize AppCheck instance
const appCheckInstance = initializeAppCheck(getApp(), {
  provider: new ReCaptchaV3Provider('your-recaptcha-key'),
  isTokenAutoRefreshEnabled: true,
});

/**
 * Helper function to call Firebase Functions securely.
 * @param functionName - The name of the Firebase Function to call.
 * @param payload - The payload to send to the function.
 * @returns The response from the Firebase Function.
 */
export async function fetchFromFirebaseFunction(functionName: string, payload: any): Promise<any> {
  try {
    // Retrieve the App Check token
    const appCheckToken = await getToken(appCheckInstance);
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User is not authenticated.");
    }

    const idToken = await user.getIdToken();

    const response = await fetch(`https://<your-region>-<your-project-id>.cloudfunctions.net/${functionName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`,
        "X-Firebase-AppCheck": appCheckToken.token,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Firebase Function call failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error calling Firebase Function:", error);
    throw error;
  }
}
