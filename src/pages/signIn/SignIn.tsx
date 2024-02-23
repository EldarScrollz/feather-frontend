import "./SignIn.scss";

import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { useState } from "react";

import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import { fetchAuth, isCurrentUserSignedIn } from "../../redux/auth/authSlice";
import { Navigate } from "react-router-dom";



export const SignIn = () =>
{
    const [isUser404, setIsUser404] = useState(false);

    const dispatch = useAppDispatch();
    const isUserSignedIn = useAppSelector(isCurrentUserSignedIn);



    const schema = yup.object().shape(
        {
            email: yup.string().required("You must enter an email").max(100, "Max. email lenght is 200 characters").email("Provide a valid email"),
            password: yup.string().required("You must enter a password").max(1000, "Max. password lenght is 1000 characters")
        });

    const { register, handleSubmit, formState: { errors } } = useForm(
        {
            resolver: yupResolver(schema),
        });



    const onSubmit = async (onSubmitValues: {email: string, password: string}) =>
    {
        const data = await dispatch(fetchAuth(onSubmitValues));

        if (!data.payload) { return setIsUser404(true); }
    };



    if (isUserSignedIn) return <Navigate to="/" />;



    return (
        <div className="sign-in">
            <form onSubmit={handleSubmit(onSubmit)} className="sign-in__form">

                <h2>Sign in to <span style={{ color: "#c52b2b" }}>FEATHER</span></h2>
                {errors.email?.message && <p>{errors.email?.message}</p>}
                <input
                    placeholder="Email..."
                    {...register("email")}
                    style={{ borderBottom: errors.email?.message && ".15rem solid rgb(214, 12, 255)" }}
                ></input>
                {errors.password?.message && <p>{errors.password?.message}</p>}
                <input
                    type="password"
                    placeholder="Password..."
                    {...register("password")}
                    style={{ borderBottom: errors.password?.message && ".15rem solid rgb(214, 12, 255)" }}
                ></input>
                {isUser404 && <p>Incorrect username or password</p>}
                <button type="submit">Sign in</button>
            </form>
        </div>
    );
};