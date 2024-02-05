import "./Modal.scss";
import { useEffect, useRef } from "react";



interface IModalProps {
    text: string,
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>,
    performAction: () => void,
}

export const Modal = ({ text, setShowModal, performAction: deletePost, }: IModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);



    useEffect(() => {
        const closeModal = (e: MouseEvent) => {
            if (!(e.target instanceof HTMLElement)) return;

            if (e.target.tagName !== "BUTTON" && e.target.parentElement?.tagName !== "BUTTON" && !modalRef.current?.contains(e.target)) { setShowModal(false); }
        };

        document.addEventListener("click", closeModal);
        return () => { document.removeEventListener("click", closeModal); };
    }, [setShowModal]);

    return (
        <div className="modal">
            <div className="modal__box" ref={modalRef}>
                <p>{text}</p>
                <div className="modal__button-wrapper">
                    <button onClick={() => { deletePost(); setShowModal(false); }}>Yes</button>
                    <button onClick={() => { setShowModal(false); }}>No</button>
                </div>
            </div>
        </div>
    );
};