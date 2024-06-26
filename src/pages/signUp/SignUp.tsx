import "./SignUp.scss";
import "../../utils/imgCropper.scss";

import { uploadImage } from "../../utils/uploadImage";
import { checkImageExtension } from "../../utils/checkImageExtension";
import Cropper, { Area } from "react-easy-crop";
import { returnCroppedImage } from "../../utils/returnCroppedImage";

import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { useRef, useState } from "react";

import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import { selectIsUserSignedIn, setUserData } from "../../redux/user/userSlice";
import { Navigate } from "react-router-dom";
import { useSignUpUserMutation } from "../../redux/user/userApi";



export const SignUp = () => {
    const dispatch = useAppDispatch();
    const isUserSignedIn = useAppSelector(selectIsUserSignedIn);
    const [signUpUser] = useSignUpUserMutation();

    const noAvatarUrl = process.env.REACT_APP_BACKEND + process.env.REACT_APP_NOIMG;
    const [avatarUrl, setAvatarUrl] = useState(noAvatarUrl);

    const inputFileRef = useRef<HTMLInputElement>(null);

    const [emailNameError, setEmailNameError] = useState("");
    const [imgExtError, setImgExtError] = useState("");

    // react-easy-crop ------------------------------------------------------------------------------------------------------------------
    const [newAvatarBlobToCrop, setNewAvatarBlobToCrop] = useState("");
    const [croppedAvatarFile, setCroppedAvatarFile] = useState<File | null>(null);
    const [isCroppingImg, setIsCroppingImg] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedPixels, setCroppedPixels] = useState({});
    const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => setCroppedPixels(croppedAreaPixels);
    const resetRefAndCrop = () => { setCrop({ x: 0, y: 0 }); setZoom(1); inputFileRef.current && (inputFileRef.current.value = ""); };
    //-----------------------------------------------------------------------------------------------------------------------------------


    // Form validation -------------------------------
    const schema = yup.object().shape(
        {
            email: yup.string().required("You must enter an email").max(100, "Max. email lenght is 200 characters").email("Provide a valid email"),
            password: yup.string().required("You must enter a password").min(4, "Min. password lenght is 4 characters").max(1000, "Max. password lenght is 1000 characters"),
            name: yup.string().required("You must enter a name").max(32, "Max. name lenght is 32 characters"),
        });

    const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema), });
    //------------------------------------------------



    const onSubmit = async (onSubmitValues: { email: string, password: string, name: string; }) => {
        if (!inputFileRef.current?.files) return;

        try {
            const imgPath = await uploadImage(croppedAvatarFile);
            const props = { ...onSubmitValues, userAvatar: (avatarUrl === noAvatarUrl) ? process.env.REACT_APP_NOIMG : imgPath };
            const userData = await signUpUser({ ...props }).unwrap();
            window.localStorage.setItem("wasUserSignedIn", "true"); // prevents flickering of navbar
            await dispatch(setUserData(userData));
        } catch (error) {
            const serverError = (error as { data: { errorMessage: string; }; }).data.errorMessage;
            if (serverError) setEmailNameError(serverError);
            else console.error("Could not sign up!", error);
        }
    };



    const handleImageChange = (input: React.ChangeEvent<HTMLInputElement>) => {
        if (!inputFileRef.current?.files) return;

        // Size check
        if (inputFileRef.current?.files[0]?.size > 26214400) { return setImgExtError("Image size can't be higher than 25 megabytes"); }
        else if (imgExtError) { setImgExtError(""); }

        // Image extension check
        const extensionError = checkImageExtension(inputFileRef.current.files[0].type);

        if (extensionError) {
            setImgExtError(`Only ${extensionError} files are allowed.`);
        }
        else {
            setImgExtError("");
            setIsCroppingImg(true);
            input.currentTarget.files && setNewAvatarBlobToCrop(URL.createObjectURL(input.currentTarget.files[0]));
        }
    };



    if (isUserSignedIn) return <Navigate to="/" />;



    return (
        <div className="sign-up">
            <form onSubmit={handleSubmit(onSubmit)}>
                <h2>Sign up to <span style={{ color: "#c52b2b" }}>FEATHER</span></h2>

                {isCroppingImg
                    ? <div className="crop-image">
                        <Cropper
                            image={newAvatarBlobToCrop}
                            crop={crop}
                            zoom={zoom}
                            aspect={1 / 1}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}

                            restrictPosition={true}
                            objectFit={"vertical-cover"}
                            zoomSpeed={.1}
                            maxZoom={10}
                        />
                    </div>

                    :
                    <>
                        <div className="sign-up__avatar-container">
                            <img className="sign-up__avatar" src={(avatarUrl !== noAvatarUrl) ? avatarUrl : noAvatarUrl} alt="Your avatar preview" />
                        </div>
                    </>
                }

                {imgExtError && <p className="user-profile__image-error">{imgExtError}</p>}
                {isCroppingImg ?
                    <div className="crop-image__button-wrapper">
                        <button className="crop-image__button" type="button" onClick={() => returnCroppedImage(inputFileRef, croppedPixels, newAvatarBlobToCrop, setAvatarUrl, setCroppedAvatarFile, setIsCroppingImg, resetRefAndCrop)}>Apply</button>
                        <button className="crop-image__button" type="button" onClick={() => { setIsCroppingImg(false); resetRefAndCrop(); }}>Cancel</button>
                    </div>
                    : <button type="button" onClick={() => inputFileRef.current?.click()}>Select avatar</button>
                }

                <input ref={inputFileRef} type="file" accept="image/*" name="image" hidden onChange={(e) => handleImageChange(e)} />

                {errors.email?.message && <p className="sign-up__error">{errors.email?.message}</p>}
                <input
                    placeholder="Email..."
                    {...register("email")}
                    style={{ borderBottom: errors.email?.message && ".15rem solid rgb(214, 12, 255)" }}
                ></input>

                {errors.name?.message && <p className="sign-up__error">{errors.name?.message}</p>}
                <input
                    placeholder="Name..."
                    {...register("name")}
                    style={{ borderBottom: errors.name?.message && ".15rem solid rgb(214, 12, 255)" }}
                ></input>

                {errors.password?.message && <p className="sign-up__error">{errors.password?.message}</p>}
                <input
                    type="password"
                    placeholder="Password..."
                    {...register("password")}
                    style={{ borderBottom: errors.password?.message && ".15rem solid rgb(214, 12, 255)" }}
                ></input>

                {emailNameError && <p className="sign-up__error">{emailNameError}</p>}
                <button type="submit">Sign up</button>
            </form>
        </div>
    );
};