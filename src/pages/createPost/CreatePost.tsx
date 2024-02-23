import "./CreatePost.scss";
import "../../utils/imgCropper.scss";

import { uploadImage } from "../../utils/uploadImage";

import { useForm } from 'react-hook-form';
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import { useSimpleMdeOptions } from "./useSimpleMdeOptions";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { LoadingScreen } from "../../components/loadingScreen/LoadingScreen";
import { PulseLoader } from "react-spinners";
import { useCreatePostMutation, useGetPostQuery, useUpdatePostMutation } from "../../redux/posts/postsApi";



export const CreatePost = () => {
    const { id: idFromLink } = useParams();
    const navigate = useNavigate();

    const { data: post, error: postError, isLoading: isLoadingPost } = useGetPostQuery(idFromLink, { skip: idFromLink === undefined });
    const [createPost] = useCreatePostMutation();
    const [updatePost] = useUpdatePostMutation();

    const inputFileRef = useRef<HTMLInputElement>(null);
    const buttonSubmitRef = useRef<HTMLButtonElement>(null);

    const [isCreatePostLoading, setIsCreatePostLoading] = useState(true);
    const [isCreatingPost, setIsCreatingPost] = useState(false);

    const noPostImgUrl = process.env.REACT_APP_BACKEND as string + process.env.REACT_APP_NOIMG as string;

    const [postImgPath, setPostImgPath] = useState("");
    const [postImgUrl, setPostImgUrl] = useState(noPostImgUrl);

    const [text, setText] = useState("");
    const [noTextError, setNoTextError] = useState({ status: false, message: "You must add a description" });
    const [imgExtError, setImgExtError] = useState("");


    
    useEffect(() => {
        if (idFromLink) {
            if (post) {
                setText(post.text);
                setPostImgPath(post.postImg);
                setPostImgUrl(process.env.REACT_APP_BACKEND + post.postImg);

                // React hook form default values.
                reset({
                    title: post?.title,
                    tags: post?.tags.toString().replace(/,/g, " ")
                });
            }
        }

        if (!isLoadingPost) setIsCreatePostLoading(false);
    }, [post]);



    // Form validation -----------------------------------------------------------------------------------------------
    const schema = yup.object().shape(
        {
            title: yup.string().max(200, "Max. title lenght is 200 characters").required("You must enter a title").trim(),
            tags: yup.string().max(50, "Max. tags lenght is 50 characters").test(
                'tags-size-limit',
                'Max. tags size is 3 words',
                (val) => { return (val!.split(" ").filter(e => e).length > 3) ? false : true; }
            ),
        });


    const { register, handleSubmit, reset, formState: { errors } } = useForm<{ title: string, tags: string | undefined; }>(
        {
            resolver: yupResolver(schema),
            defaultValues: useMemo(() => {
                return {
                    title: post?.title,
                    tags: post?.tags.toString().replace(/,/g, " ")
                };
            }, [post])
        });
    //----------------------------------------------------------------------------------------------------------------



    // simple MDE ----------------------------------------------------------------------------------------------------
    const simpleMdeOptions = useSimpleMdeOptions();

    const simpleMdeOnChange = useCallback((value: string) => {
        if (value.replace(/\s/g, "") === "") { setNoTextError(i => ({ ...i, status: true, message: "You must add a description" })); }
        else if (value.length >= 5000) { setNoTextError(i => ({ ...i, status: true, message: "Max. description lenght is 5000 characters" })); }
        else { setNoTextError(i => ({ ...i, status: false, message: "" })); }

        setText(value);
    }, []);
    //----------------------------------------------------------------------------------------------------------------



    // Create the post if validation succeeds ------------------------------------------------------------------------
    const onSubmit = async (onSubmitValues: { title: string, tags: string | undefined; }) => {
        try {
            setIsCreatingPost(true);

            if (!inputFileRef.current?.files) return;
            if (text === "") { setNoTextError(i => ({ ...i, status: true, message: "You must add a description" })); return; }

            const croppedImgPath = await uploadImage(inputFileRef.current.files[0] as File);

            const formattedTags = (onSubmitValues.tags && onSubmitValues.tags[0] !== "") ? onSubmitValues.tags?.replace(/[\s#]+/g, ' ').trim().split(" ") : [];

            const body = {
                title: onSubmitValues.title,
                tags: formattedTags,
                text,
                postImg: (croppedImgPath) ? croppedImgPath : (postImgUrl === noPostImgUrl) ? process.env.REACT_APP_NOIMG as string : postImgPath,
            };

            // If original image hasn't been affected - do not delete the current image.
            const oldPostImgQuery = (postImgUrl === noPostImgUrl) ? `/?oldPostImg=${postImgPath}` : "";

            const resultData = idFromLink
                ? await updatePost({ id: idFromLink, oldPostImgQuery, ...body }).unwrap()
                : await createPost(body).unwrap();;

            navigate(`/posts/${idFromLink ? idFromLink : resultData?._id}`);
        }
        catch (error) { console.error("Could not create the new post!", error); }
        finally { setIsCreatingPost(false); }
    };
    //----------------------------------------------------------------------------------------------------------------



    if (postError) { return <p className="error">Could not get the post, please try again later.</p>; }
    if (isCreatePostLoading) return <LoadingScreen />;



    return (
        <>
            <form className="create-post" onSubmit={handleSubmit(onSubmit)} >

                <div className="create-post__preview-container">
                    <img className="create-post__preview" src={postImgUrl} alt="Post preview" />
                </div>
                {imgExtError && <p className="create-post__error">{imgExtError}</p>}

                <input ref={inputFileRef} type="file" accept="image/*" name="image" hidden onChange={(e) => {
                    if (!inputFileRef.current?.files) return;

                    // Size check
                    if (inputFileRef.current.files[0].size > 26214400) { return setImgExtError("Image size can't be higher than 25 megabytes"); }
                    else if (imgExtError) { setImgExtError(""); }

                    // Extension check
                    const allowedExtensions = ["image/png", "image/jpg", "image/jpeg", "image/webp", "image/gif"];
                    if (!allowedExtensions.includes(inputFileRef.current.files[0].type)) { return setImgExtError("Only JPG/JPEG, PNG, WEBP and GIF files are allowed"); }
                    else if (imgExtError) { setImgExtError(""); }

                    setPostImgUrl(URL.createObjectURL(inputFileRef.current.files[0]));
                }} />

                {(postImgUrl && postImgUrl !== noPostImgUrl)
                    ? <button type="button" onClick={() => { setPostImgUrl(noPostImgUrl); inputFileRef.current!.value = ""; }}>Delete preview image</button>
                    : <button type="button" onClick={() => inputFileRef.current?.click()}>Upload preview image</button>
                }

                <div className="create-post__title-wrapper">
                    {errors.title?.message && <p className="create-post__error">{errors.title?.message}</p>}
                    <input {...register("title")} placeholder="Title..." style={{ borderBottom: errors.title?.message && ".15rem solid rgb(214, 12, 255)" }} />
                </div>

                <div className="create-post__tags-wrapper">
                    {errors.tags?.message && <p className="create-post__error">{errors.tags?.message}</p>}
                    <input {...register("tags")} placeholder="Tags..." style={{ borderBottom: errors.tags?.message && ".15rem solid rgb(214, 12, 255)" }} />
                </div>

                <button type="submit" ref={buttonSubmitRef} hidden></button>
            </form>

            {noTextError.status && <p className="create-post-editor__text-error"> {noTextError.message}</p>}
            <SimpleMDE className="create-post-editor" value={text} onChange={simpleMdeOnChange} options={simpleMdeOptions} />

            <div className="create-post-create-cancel">
                {!isCreatingPost
                    ? <button onClick={() => buttonSubmitRef.current?.click()}>{idFromLink ? "Save" : "Create post"}</button>
                    : <button><PulseLoader color={"#c52b2b"} size={5} /></button>
                }
                <button onClick={() => navigate("/")}>Cancel</button>
            </div>
        </>
    );
};