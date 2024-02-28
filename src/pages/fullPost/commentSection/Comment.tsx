import "./Comment.scss";

import { IComment } from "../../../models/IComment";
import { IUser } from "../../../models/IUser";

import { useAppSelector } from "../../../redux/hooks";

import { useEffect, useRef, useState } from "react";
import { PulseLoader } from "react-spinners";
import ReactMarkdown from "react-markdown";

import { Reply } from "./replies/Reply";
import { formatRelativeTime } from "../../../utils/relativeTimeFormatter";
import { Modal } from "../../../components/modal/Modal";
import { useCreateCommentMutation, useDeleteCommentMutation, useGetRepliesQuery, useUpdateCommentMutation } from "../../../redux/comments/commentsApi";
import { useUpdatePostMutation } from "../../../redux/posts/postsApi";



interface ICommentProps {
    comment: IComment,
    fullPostCommentsCount: number,
    setFullPostCommentsCount: React.Dispatch<React.SetStateAction<number>>,
}

export const Comment = ({ comment, fullPostCommentsCount, setFullPostCommentsCount }: ICommentProps) => {
    const user = comment.user as IUser;

    const moddedDate = formatRelativeTime(new Date(comment.createdAt));

    const userData = useAppSelector((state) => state.auth.userData);


    const { data: replies, error: repliesError, isLoading: isLoadingReplies } = useGetRepliesQuery(comment._id);

    const [createComment] = useCreateCommentMutation();
    const [updateComment] = useUpdateCommentMutation();
    const [deleteComment] = useDeleteCommentMutation();

    const [updatePost] = useUpdatePostMutation();

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
    // const [commentReplies, setCommentReplies] = useState<IComment[]>([]);
    const [commentRepliesCount, setCommentRepliesCount] = useState(comment.repliesCount);



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



    // if (!replies) return <><h1>todo: delete this</h1></>;

    // todo: How should we handle this. Supply both comments and replies as props from fullPost or -
    // - handle everything here (make loading spinner for "replies count" button when loading replies)?



    // Comments ----------------------------------------------------------------------
    const handleDeleteComment = async () => {
        if (!replies) return console.error('Could not delete the comment, "replies" invalid!');

        try {
            const commentBody =
            {
                _id: comment._id,
                postId: comment.postId,
                commentParentId: comment.commentParentId,
            };

            await deleteComment({ commentId: comment._id, body: commentBody }).unwrap();

            // Decrease commentsCount when deleting the main comment (we should take replies into account) -----------------
            const decreaseAmount = replies.length + 1;
            setFullPostCommentsCount((prev) => (prev - decreaseAmount) <= 0 ? 0 : (prev - decreaseAmount));
            // Update backend's commentCount (so that on page refresh the count would be synced)
            await updatePost({
                id: comment.postId,
                body: { commentsCount: ((fullPostCommentsCount - decreaseAmount) <= 0) ? 0 : (fullPostCommentsCount - decreaseAmount) }
            }).unwrap();
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

        try {
            updateComment({ commentId: comment._id, body: { text: editedCommentText } }).unwrap();
        }
        catch (error) { console.error("Could not edit the comment", error); }

        setCurrentCommentText(editedCommentText);
        setIsCommentEdited(true);

        setEditingcomment(false);

        setIsLoadingEditing(false);
    };



    const replyToComment = async () => {
        if (!replyTextareaRef.current || !replyTextareaRef.current.value || !userData) return;

        const replyText = replyTextareaRef.current.value;

        if (replyText.length > 1000) return;
        if (!replyText) return;

        setIsReplyingLoading(true);

        const body =
        {
            postId: comment.postId,
            commentParentId: comment._id,
            text: replyText,
            user: userData?._id,
        };

        try {
            await createComment({ ...body }).unwrap();
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

            {userData?._id === user._id &&
                <div className="comment__options">
                    <button onClick={() => setShowModal(true)}>X</button>
                    <button onClick={() => { setEditingcomment(!isEditingComment); }}>{isEditingComment ? "Cancel editing" : "edit"}</button>
                </div>
            }

            <div className="comment__user-wrapper">
                <img src={process.env.REACT_APP_BACKEND + user.userAvatar} alt="User's avatar" />
                <div className="comment__user">
                    <p>{user.name}</p>
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


            <div className="comment_replies" style={{ display: !showReplies || (commentRepliesCount <= 0) ? "none" : "inherit" }}>
                {replies?.map((e: IComment) => {
                    return <Reply
                        key={e._id}
                        comment={e}
                        setFullPostCommentsCount={setFullPostCommentsCount}
                        setParentCommentsCount={setCommentRepliesCount}
                        userData={userData} />;
                })}
            </div>

            {showModal && <Modal text={"Delete the comment?"} setShowModal={setShowModal} performAction={() => handleDeleteComment()} />}
        </div >
    );
};