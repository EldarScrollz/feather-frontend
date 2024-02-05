import "./Comment.scss";

import { IComment } from "../../../models/IComment";

import {axiosCustom} from "../../../axiosSettings";

import { useAppSelector } from "../../../redux/hooks";
import { useEffect, useRef, useState } from "react";

import { Reply } from "./replies/Reply";
import { PulseLoader } from "react-spinners";
import ReactMarkdown from "react-markdown";
import { formatRelativeTime } from "../../../utils/relativeTimeFormatter";
import { Modal } from "../../../components/modal/Modal";



interface ICommentProps {
    comment: IComment,
    fullPostCommentsCount: number,
    setFullPostCommentsCount: React.Dispatch<React.SetStateAction<number>>,
}

export const Comment = ({ comment, fullPostCommentsCount, setFullPostCommentsCount }: ICommentProps) => {
    const userInfo = useAppSelector((state) => state.auth);
    const moddedDate = formatRelativeTime(new Date(comment.createdAt));

    const [showComment, setShowComment] = useState(true);
    const [showReplies, setShowReplies] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const commentTextareaRef = useRef<HTMLTextAreaElement>(null);
    const replyTextareaRef = useRef<HTMLTextAreaElement>(null);

    const [isLoadingEditing, setIsLoadingEditing] = useState(false);
    const [isEditingComment, setEditingcomment] = useState(false);
    const [currentCommentText, setCurrentCommentText] = useState(comment.text);
    const [commentErrorMsg, setCommentErrorMsg] = useState("");
    const [isCommentEdited, setIsCommentEdited] = useState(comment.isEdited);

    const [isReplyingLoading, setIsReplyingLoading] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [commentReplies, setCommentReplies] = useState<IComment[]>([]);
    const [commentRepliesCount, setCommentRepliesCount] = useState(comment.repliesCount);

    // Get replies on start
    useEffect(() => {
        axiosCustom.get(`/comments/replies/${comment._id}`).then((res) => { setCommentReplies(res.data); })
            .catch((error) => { console.error("Could not get comment's replies", error); });
    }, [comment._id]);



    //Adjust the textarea on edit button click
    useEffect(() => {
        if (commentTextareaRef.current) {
            commentTextareaRef.current.style.height = 'inherit';
            commentTextareaRef.current.style.height = `${commentTextareaRef.current.scrollHeight}px`;
        }
    }, [isEditingComment]);



    // Resize textarea according to its content and validate the input
    const resizeTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.target.style.height = 'inherit';
        e.target.style.height = `${e.target.scrollHeight}px`;

        const commentTextFromTextarea = e.target.value;

        if (commentTextFromTextarea.length > 1000) { return setCommentErrorMsg("Max. comment lenght is 1000 chars."); }
        if (commentTextFromTextarea.length <= 0) { return setCommentErrorMsg("Comment can't be empty"); }

        if (commentTextFromTextarea.length > 1000) { return setCommentErrorMsg("Max. comment lenght is 1000 chars."); }
        if (commentTextFromTextarea.length <= 0) { return setCommentErrorMsg("Comment can't be empty"); }

        setCommentErrorMsg("");
    };



    // Comments ----------------------------------------------------------------------
    const deleteComment = async () => {
        try {
            const data =
            {
                _id: comment._id,
                postId: comment.postId,
                commentParentId: comment.commentParentId,
            };

            await axiosCustom.delete(`/comments/${comment._id}`, { data });

            // Decrease commentsCount when deleting the main comment (we should take replies into account) -----------------
            const decreaseAmount = commentReplies.length + 1;
            setFullPostCommentsCount((prev) => (prev - decreaseAmount) <= 0 ? 0 : (prev - decreaseAmount));
            // Update backend's commentCount (so that on page refresh the count would be synced)
            await axiosCustom.patch(`/posts/${comment.postId}`, { commentsCount: (fullPostCommentsCount - decreaseAmount) <= 0 ? 0 : (fullPostCommentsCount - decreaseAmount) });
            // -------------------------------------------------------------------------------------------------------------

            setShowComment(false);
        }
        catch (error) { console.error("Could not delete the comment", error); }
    };



    const editComment = async () => {
        if (!commentTextareaRef.current || !commentTextareaRef.current.value) return;

        const editedCommentText = commentTextareaRef.current.value;

        if (editedCommentText === currentCommentText) return;
        if (editedCommentText.length > 1000) return;

        setIsLoadingEditing(true);

        try { await axiosCustom.patch(`/comments/${comment._id}`, { text: editedCommentText }); }
        catch (error) { console.error("Could not edit the comment", error); }

        setCurrentCommentText(editedCommentText);
        setIsCommentEdited(true);


        setEditingcomment(false);

        setIsLoadingEditing(false);
    };



    const replyToComment = async () => {
        if (!replyTextareaRef.current || !replyTextareaRef.current.value) return;

        const replyText = replyTextareaRef.current.value;

        if (replyText.length > 1000) return;
        if (!replyText) return;

        setIsReplyingLoading(true);

        const body =
        {
            postId: comment.postId,
            commentParentId: comment._id,
            text: replyText,
            user: userInfo.userData?._id,
        };

        try {
            await axiosCustom.post("/comments", body);
            // Refresh replies
            await axiosCustom.get(`/comments/replies/${comment._id}`).then((res) => { setCommentReplies(res.data); });
        }
        catch (error) { console.error("Could not create the reply", error); }


        replyTextareaRef.current && (replyTextareaRef.current.value = "");
        replyTextareaRef.current && (replyTextareaRef.current.style.height = "22px");

        setFullPostCommentsCount(prev => prev + 1);
        setCommentRepliesCount(prev => prev + 1);

        setIsReplying(false);
        setShowReplies(true);

        setIsReplyingLoading(false);
    };
    //--------------------------------------------------------------------------------



    if (!showComment) { return <></>; }



    return (
        <div className="comment">

            {userInfo.userData?._id === comment.user._id &&
                <div className="comment__options">
                    <button onClick={() => setShowModal(true)}>X</button>
                    <button onClick={() => { setEditingcomment(!isEditingComment); }}>{isEditingComment ? "Cancel editing" : "edit"}</button>
                </div>
            }

            <div className="comment__user-wrapper">
                <img src={process.env.REACT_APP_BACKEND + comment.user.userAvatar} alt="User's avatar" />
                <div className="comment__user">
                    <p>{comment.user.name}</p>
                    <p>{moddedDate} {isCommentEdited && "(edited)"}</p>
                </div>
            </div>

            {isEditingComment
                ? <div className="comment__edit">
                    {commentErrorMsg && <p className="comment__error-msg">{commentErrorMsg}</p>}
                    <textarea ref={commentTextareaRef} defaultValue={currentCommentText} rows={1} onChange={(e) => resizeTextarea(e)} />

                    {!isLoadingEditing
                        ? <button onClick={() => { editComment(); }}>confirm</button>
                        : <button><PulseLoader color={"#c52b2b"} size={7} /></button>
                    }
                </div>
                : <ReactMarkdown className="comment__text" children={currentCommentText} />
            }

            <div className="comment__reply">
                <div className="comment__reply-options">
                    {(commentRepliesCount > 0) && <button onClick={() => setShowReplies(!showReplies)}>{showReplies ? "hide replies" : `replies: ${commentRepliesCount}`}</button>}
                    <button className="comment__reply-button" onClick={() => setIsReplying(!isReplying)}>{isReplying ? "cancel" : "reply"}</button>
                </div>
                {isReplying &&
                    <>
                        {commentErrorMsg && <p className="comment__error-msg">{commentErrorMsg}</p>}
                        <textarea placeholder="Add a reply..." ref={replyTextareaRef} rows={1} onChange={(e) => resizeTextarea(e)} />

                        {!isReplyingLoading
                            ? <button className="comment__reply-confirm" onClick={() => { replyToComment(); }}>confirm</button>
                            : <button className="comment__reply-confirm"><PulseLoader color={"#c52b2b"} size={7} /></button>
                        }
                    </>
                }
            </div>


            <div className="comment_replies" style={{ display: showReplies ? "inherit" : "none" }}>
                {commentReplies?.map((e: IComment) => {
                    return <Reply
                        key={e._id}
                        comment={e}
                        setFullPostCommentsCount={setFullPostCommentsCount}
                        setParentCommentsCount={setCommentRepliesCount}
                        userData={userInfo.userData} />;
                })}
            </div>

            {showModal && <Modal text={"Delete the comment?"} setShowModal={setShowModal} performAction={() => deleteComment()} />}
        </div >
    );
};;