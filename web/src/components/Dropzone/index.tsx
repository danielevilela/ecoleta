import React, {useCallback, useState } from 'react'
import {useDropzone} from 'react-dropzone'
import './styles.css';
import { FiUpload } from 'react-icons/fi';

interface Props {
    onFileUploaded: (file: File) => void;
}

const Dropzone: React.FC<Props> = ({ onFileUploaded }) => {
    const [selectedFileUrl, setSelectedFileUrl] = useState('');

  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];

    const fileUrl = URL.createObjectURL(file);

    setSelectedFileUrl(fileUrl);
    onFileUploaded(file);

  }, [onFileUploaded]);

  const {getRootProps, getInputProps} = useDropzone({
      onDrop,
      accept: 'image/*'
    });

  return (
    <div className="dropzone" {...getRootProps()}>
      <input {...getInputProps()} accept="image/*" />
        { selectedFileUrl 
        ?  <img  src={selectedFileUrl} alt="thumbnail" /> 
        : (
            <p>
            <FiUpload />
            Click to upload or drag your picture here
            </p>
        )
    }
    </div>
  )
};

export default Dropzone;