import yearpeerLogo from "/yearpeer-logo.svg";
import googleLogo from "/google.svg";
import {Link, useNavigate} from "react-router";
import {useEffect} from "react";
import {useAuth} from "@/components/contexts/AuthContext.tsx";


const SignInPage = () => {
    const {login, currentUser} = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser)
        {
            navigate("/")
        }
    }, [currentUser]);

    return (
        <div className="flex flex-col h-screen w-screen justify-center items-center bg-[#E5E5E5]">

            {/* Sign In Card */}
            <div className="card bg-card-gradient max-w-sm shadow-sm">
                <div className="card-body rounded-box bg-white shadow-sm">
                    <div className="flex gap-2 flex-col w-full items-center justify-center pb-6">
                        <img src={yearpeerLogo}
                             alt="YearPeer"
                             height={27}/>
                        <span
                            className="text-sm text-[#747686]">Welcome! Please fill in the details to get started.</span>
                    </div>

                    <div className="h-[1px] w-full bg-[#00000012]"/>

                    <button onClick={login} className="btn btn-sm text-[#747686] my-6">
                        <img src={googleLogo} alt="Google" width={16}/>
                        Continue with Google
                    </button>

                    <span className=" mx-2 block text-center text-xs text-[#747686]">
                    By using Yearpeer you agree to the <Link to="/terms-of-use" className="text-[#212126] underline">Terms of Use</Link> and <Link
                        to="/privacy-policy" className="text-[#212126] underline">Privacy Policy</Link>
                    </span>

                </div>
                <div className="card-footer">
                    <span className="flex gap-2 py-6  text-sm justify-center items-center text-[#747686]">
                    © {new Date().getFullYear()} Yearpeer. All rights reserved.
                </span>
                </div>
            </div>
            {/* End of Sign In Card*/}
        </div>

    );
};

export default SignInPage;
