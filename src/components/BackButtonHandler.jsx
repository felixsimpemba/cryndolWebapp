import { useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { useNavigate, useLocation } from 'react-router-dom';

const BackButtonHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Define the handler
        const handleBackButton = async () => {
            // Add a listener for the back button
            // We use 'await' here because addListener returns a promise resolving to a handle
            await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
                // Define root paths where the app should exit
                const rootPaths = ['/', '/login', '/register', '/app/dashboard'];

                // Check if the current path is a root path
                // We use location.pathname to get the current route
                // If we are on a root path, we exit the app
                if (rootPaths.includes(location.pathname)) {
                    CapacitorApp.exitApp();
                } else {
                    // Otherwise, go back in history
                    navigate(-1);
                }
            });
        };

        handleBackButton();

        // Cleanup listener on unmount
        return () => {
            CapacitorApp.removeAllListeners();
        };
    }, [navigate, location]); // Re-run if location changes to ensure fresh closure state if needed, though with this logic strictly relying on 'location' inside, it's safer.  
    // Note: Re-adding listener on every navigation might be noisy but ensures correct closure values for 'location'. 
    // An alternative is using a ref for location, but this is simple and robust for now.

    return null; // This component doesn't render anything
};

export default BackButtonHandler;
