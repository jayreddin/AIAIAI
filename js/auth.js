// Authentication Logic
export async function updateUiForAuthState(isSignedIn, {authSectionDiv, chatUiDiv, signOutButton, authStatusDiv, usernameDisplay}) {
    if (!authSectionDiv || !chatUiDiv) { console.error("Core UI missing."); return; }
    if (isSignedIn) {
        // Show UI immediately for better perceived performance
        authSectionDiv.style.display = 'none';
        chatUiDiv.style.display = 'flex';
        if (signOutButton) signOutButton.style.display = 'inline-block';
        if (authStatusDiv) authStatusDiv.textContent = 'Fetching user info...';
        // Fetch user info and settings in background
        try {
            if (typeof puter === 'undefined' || !puter.auth) throw new Error("Puter SDK/auth missing.");
            const user = await puter.auth.getUser();
            if (authStatusDiv) authStatusDiv.textContent = '';
            if (usernameDisplay) {
                usernameDisplay.textContent = user.username;
                usernameDisplay.style.display = 'block';
            }
            console.log("User signed in:", user);
        } catch (error) {
            console.error("Sign-in update/fetch error:", error);
            if (authStatusDiv) authStatusDiv.textContent = `Sign-in error: ${error.message || 'Unknown'}`;
            if (usernameDisplay) usernameDisplay.style.display = 'none';
            authSectionDiv.style.display = 'block';
            chatUiDiv.style.display = 'none';
            if (signOutButton) signOutButton.style.display = 'none';
        }
    } else {
        if (authStatusDiv) authStatusDiv.textContent = 'Not signed in.';
        authSectionDiv.style.display = 'block';
        chatUiDiv.style.display = 'none';
        if (signOutButton) signOutButton.style.display = 'none';
        if (usernameDisplay) usernameDisplay.style.display = 'none';
    }
}

export async function handleSignIn(authStatusDiv, signInButton) {
    console.log("Sign in clicked");
    if (authStatusDiv) authStatusDiv.textContent = 'Signing in...';
    signInButton.disabled = true;
    signInButton.textContent = '...';
    try {
        if (!puter.auth) throw new Error("SDK/auth missing.");
        const signedIn = await puter.auth.signIn();
        console.log("signIn result:", signedIn);
        return signedIn;
    } catch (error) {
        console.error("signIn error:", error);
        if (authStatusDiv) authStatusDiv.textContent = `Error: ${error.message || 'Unknown'}`;
        signInButton.disabled = false;
        signInButton.textContent = 'Sign In';
        return false;
    }
}

export function handleSignOut({messageDisplay, chatInput, sendButton}) {
    console.log("Sign out clicked");
    try {
        if (!puter.auth) throw new Error("SDK/auth missing.");
        puter.auth.signOut();
        console.log("Signed out.");
        if (messageDisplay) messageDisplay.innerHTML = '';
        if (chatInput) chatInput.disabled = true;
        if (sendButton) sendButton.disabled = true;
    } catch (error) {
        console.error("Sign out error:", error);
        throw error;
    }
}