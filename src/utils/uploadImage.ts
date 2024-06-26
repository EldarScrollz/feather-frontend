import { axiosCustom } from "../axiosSettings";

export const uploadImage = async (file: File | null) => {
    try {
        if (!file) return; /* process.env.REACT_APP_NOIMG; */ // If user hasn't selected the avatar or the file is undefined/null

        const formData = new FormData();
        formData.append("image", file);
        const { data } = await axiosCustom.post<{ url: string; }>("/upload", formData);

        return data.url;
    }
    catch (error) {
        console.error("Could not upload the image!", error);
        alert("Could not upload the image!");
    }
};