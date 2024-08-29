import React, { useState, ChangeEvent } from 'react';
import './App.css'
const FileUpload: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleUpload = () => {

        console.log("aaa")
        // Replace with your upload URL
        fetch('http://127.0.0.1:3000/register', {
            method: 'POST',
            body: "aaa",
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });

    };

    return (
        <div>
            <div className='upload-card'>
                <div className='card-content'>
                    <div >Get A File Timestamp</div>
                    <div>
                        <input type="file" onChange={handleFileChange} />
                        <button onClick={handleUpload} disabled={!selectedFile}>
                            Check
                        </button>
                    </div>
                </div>
            </div >
            <div className='upload-card'>

                <div className='card-content'>
                    <div >Timestamp A File</div>
                    <div>
                        <input type="file" onChange={handleFileChange} />
                        <button onClick={handleUpload} disabled={false}>
                            Register
                        </button>
                    </div>
                </div>
            </div >
        </div>
    );
};

export default FileUpload;
