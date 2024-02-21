import "./UserProfile.scss";
import "../../utils/imgCropper.scss";

import { IUser } from "../../models/IUser";

import { axiosCustom } from "../../axiosSettings";

import { uploadImage } from "../../utils/uploadImage";
import Cropper, { Area } from "react-easy-crop";
import { returnCroppedImage } from "../../utils/returnCroppedImage";

import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { useForm } from 'react-hook-form';
import { useNavigate } from "react-router-dom";

import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import { fetchMe, signOut } from "../../redux/slices/authSlice";

import { PulseLoader } from "react-spinners";
import { LoadingScreen } from "../../components/loadingScreen/LoadingScreen";
import { Modal } from "../../components/modal/Modal";
import { fetchPosts } from "../../redux/posts/postsSlice";



interface IProfileData {
    email: string,
    name: string,
    isChangePassword: boolean | undefined,
    currentPassword: string | undefined,
    newPassword: string | undefined,
    confirmNewPassword: string | undefined,
}

export const UserProfile = () => {
    const navigate = useNavigate();

    const dispatch = useAppDispatch();
    const auth = useAppSelector((state) => state.auth);

    const [isProfileLoading, setisProfileLoading] = useState(true);
    const [isSubmitLoading, setIsSubmitLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const inputFileRef = useRef<HTMLInputElement>(null);
    const passwordCheckboxRef = useRef<HTMLInputElement>(null);
    const userDeleteCheckboxRef = useRef<HTMLInputElement>(null);

    const [deleteUserPassword, setDeleteUserPassword] = useState("");
    const [deleteProfileError, setDeleteProfileError] = useState(false);

    const noAvatarUrl = process.env.REACT_APP_BACKEND as string + process.env.REACT_APP_NOIMG as string;
    const [avatarPath, setAvatarPath] = useState("");
    const [avatarUrl, setAvatarUrl] = useState(noAvatarUrl);
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



    useEffect(() => {
        if (auth.userData?.userAvatar && auth.userData?.userAvatar !== process.env.REACT_APP_NOIMG as string) {
            setAvatarPath(auth.userData?.userAvatar);
            setAvatarUrl(process.env.REACT_APP_BACKEND + auth.userData?.userAvatar);
        }
    }, [auth]);



    // Yup validation -------------------------------------------------------------------------------------------------------
    const schema = yup.object().shape(
        {
            email: yup.string().required("You must enter an email").max(100, "Max. email lenght is 200 characters").email("Provide a valid email"),
            name: yup.string().required("You must enter a name").max(32, "Max. name lenght is 32 characters"),

            // Password related
            isChangePassword: yup.boolean(),
            currentPassword: yup.string().when("isChangePassword", { is: true, then: (schema) => schema.min(4, "Min. password lenght is 4 characters").max(1000, "Max. password lenght is 1000 characters") }),
            newPassword: yup.string().when("isChangePassword",
                {
                    is: true,
                    then: (schema) => schema.min(4, "Min. password lenght is 4 characters").max(1000, "Max. password lenght is 1000 characters")
                }),

            confirmNewPassword: yup.string().when("isChangePassword",
                {
                    is: true,
                    then: (schema) => schema.oneOf([yup.ref("newPassword")], "Passwords do not match").min(4, "Min. password lenght is 4 characters").max(1000, "Max. password lenght is 1000 characters")
                }),
        });

    const { register, handleSubmit, setError, formState: { errors }, setValue } = useForm<IProfileData>(
        {
            resolver: yupResolver(schema),
            defaultValues: async () => {
                const { data } = await axiosCustom.get<IUser>("/auth/me");

                setisProfileLoading(false);

                return {
                    email: data.email,
                    name: data.name,
                    isChangePassword: false,
                    currentPassword: "",
                    newPassword: "",
                    confirmNewPassword: "",
                };
            },
        });
    //-----------------------------------------------------------------------------------------------------------------------


    const handleAccountDelete = async () => {
        try {
            await axiosCustom.delete(`/auth/deleteProfile/${auth.userData?._id}/${deleteUserPassword}`);
            dispatch(signOut());
            navigate("/");
        }
        catch (error: any) {
            console.error("Could not delete the user", error);
            setDeleteProfileError(error.response.data.errorMessage);
        }
    };


    const onSubmit = async (onSubmitValues: IProfileData) => {
        if (imgExtError !== "") return;

        setIsSubmitLoading(true);

        try {
            const croppedImgPath = await uploadImage(croppedAvatarFile as File);
            const oldAvatarQuery = croppedImgPath ? `/?oldAvatar=${avatarPath}` : "";
            const userAvatarToSet = croppedImgPath ? croppedImgPath : avatarPath;

            if (onSubmitValues.isChangePassword) {
                await axiosCustom.patch(`auth/editProfile${oldAvatarQuery}`,
                    {
                        email: onSubmitValues.email,
                        name: onSubmitValues.name,
                        userAvatar: userAvatarToSet,
                        isChangePassword: onSubmitValues.isChangePassword,
                        currentPassword: onSubmitValues.currentPassword,
                        newPassword: onSubmitValues.newPassword,
                        confirmNewPassword: onSubmitValues.confirmNewPassword,
                    });
            }
            else {
                await axiosCustom.patch(`auth/editProfile${oldAvatarQuery}`,
                    {
                        email: onSubmitValues.email,
                        name: onSubmitValues.name,
                        userAvatar: userAvatarToSet,
                        isChangePassword: onSubmitValues.isChangePassword,
                    });
            }

            dispatch(fetchMe());
            dispatch(fetchPosts());

            navigate("/");
        }
        catch (error) { console.error("Could not edit user's information!", error); setError("currentPassword", { type: "custom", message: "Incorrect password" }); }

        setIsSubmitLoading(false);
    };



    if (isProfileLoading || auth.status === "loading") return <LoadingScreen />;



    return (
        <>
            <form className="user-profile" onSubmit={handleSubmit(onSubmit)}>

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

                    : <>
                        <div className="user-profile__avatar-container">
                            <img className="user-profile__avatar" src={(avatarUrl !== noAvatarUrl) ? avatarUrl : noAvatarUrl} alt="Your avatar preview" />
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

                <input ref={inputFileRef} type="file" accept="image/*" name="image" hidden onChange={(e) => {
                    if (!inputFileRef.current?.files) return;

                    // Size check
                    if (inputFileRef.current?.files[0]?.size > 26214400) { return setImgExtError("Image size can't be higher than 25 megabytes"); }
                    else if (imgExtError) { setImgExtError(""); }

                    // Extension check
                    const allowedExtensions = ["image/png", "image/jpg", "image/jpeg", "image/gif"];
                    if (!allowedExtensions.includes(inputFileRef.current?.files[0]?.type)) { return setImgExtError("Only JPG/JPEG, PNG and GIF files are allowed"); }
                    else if (imgExtError) { setImgExtError(""); }

                    setIsCroppingImg(true);
                    e.currentTarget.files && setNewAvatarBlobToCrop(URL.createObjectURL(e.currentTarget.files[0]));
                }} />

                <div className="user-profile__name">
                    <p>Name</p>
                    {errors.name?.message && <p className="user-profile__error-text">{errors.name?.message}</p>}
                    <input {...register("name")} />
                </div>

                <div className="user-profile__email">
                    <p>Email</p>
                    {errors.email?.message && <p className="user-profile__error-text">{errors.email?.message}</p>}
                    <input {...register("email")} />
                </div>

                <input className="user-profile__password-checkbox" type="checkbox" ref={passwordCheckboxRef} onChange={(e) => setValue("isChangePassword", e.target.checked)} hidden />
                <button type="button" onClick={() => passwordCheckboxRef.current?.click()}>Change password</button>

                <div className="user-profile__change-password">
                    <div>
                        <p>Current password</p>
                        {errors.currentPassword?.message && <p className="user-profile__error-text">{errors.currentPassword?.message}</p>}
                        <input type="password" {...register("currentPassword")} />
                    </div>

                    <div>
                        <p>New password</p>
                        {errors.newPassword?.message && <p className="user-profile__error-text">{errors.newPassword?.message}</p>}
                        <input type="password" {...register("newPassword")} />
                    </div>

                    <div>
                        <p>Repeat new password</p>
                        {errors.confirmNewPassword?.message && <p className="user-profile__error-text">{errors.confirmNewPassword?.message}</p>}
                        <input type="password" {...register("confirmNewPassword")} />
                    </div>
                </div>

                {!isSubmitLoading
                    ? <button className="user-profile__submit-form" type="submit">Save changes</button>
                    : <button className="user-profile__submit-form"><PulseLoader color={"#c52b2b"} size={7} /></button>
                }
            </form >

            <div className="user-profile-delete">
                <input className="user-profile-delete__checkbox" type="checkbox" ref={userDeleteCheckboxRef} hidden />
                <button onClick={() => userDeleteCheckboxRef.current?.click()}>Delete profile</button>

                <div className="user-profile-delete__confirm">
                    <p>Password</p>
                    {deleteProfileError && <p className="user-profile__error-text"> Incorrect password</p>}
                    <input type="password" onChange={(e) => setDeleteUserPassword(e.currentTarget.value)} />
                    <button onClick={() => setShowModal(true)}>confirm</button>
                </div>
            </div>

            {showModal && <Modal text={"Delete the account?"} setShowModal={setShowModal} performAction={() => handleAccountDelete()} />}
        </>
    );
};;