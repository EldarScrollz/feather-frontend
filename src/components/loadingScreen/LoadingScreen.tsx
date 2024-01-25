import "./LoadingScreen.scss"

import SquareLoader from "react-spinners/SquareLoader";

export const LoadingScreen = () =>
{
    return (
        <div className="loading-screen">
            <SquareLoader
                color={"#c52b2b"}
                // loading={loading}
                // cssOverride={override}
                size={150}
            //aria-label="Loading Spinner"
            //data-testid="loader"
            />
        </div>
    );
};