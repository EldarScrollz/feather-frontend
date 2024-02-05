import getCroppedImg from "./getCroppedImg";


export const returnCroppedImage = async (
    inputFileRef: React.RefObject<HTMLInputElement>,
    croppedPixels: {},
    newImgToCrop: string,
    setCurrentImg: React.Dispatch<React.SetStateAction<string>>,
    setCroppedImgFile: React.Dispatch<React.SetStateAction<File | null>>,
    setIsCroppingImg: React.Dispatch<React.SetStateAction<boolean>>,
    resetRefAndCrop: () => void,
) =>
{
    try
    {
        if (!inputFileRef.current?.files) return; 

        const blob = await getCroppedImg(newImgToCrop, croppedPixels);
        blob.name = inputFileRef.current.files[0].name;

        setCurrentImg(URL.createObjectURL(blob));
        setIsCroppingImg(false);
        setCroppedImgFile(new File([blob], blob.name, { type: blob.type }));
        
        resetRefAndCrop();
    } catch (error) { console.error("Could not crop the image", error); }
};