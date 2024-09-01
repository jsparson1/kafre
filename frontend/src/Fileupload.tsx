import React, { useState, ChangeEvent, useCallback } from 'react';
import './App.css'

const FileUpload: React.FC = () => {
    //todo remove nulls add better logging
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [hashResult, setHashResult] = useState<string>("No File Registered");
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            hashFile(selectedFile);
        }
    };

    const hashFile = useCallback(async (file: File,) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target?.result as ArrayBuffer;
                console.log(arrayBuffer)
                const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
                console.log(hashBuffer)
                const hashArray = Array.from(new Uint8Array(hashBuffer));

                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                setHashResult(hashHex);

                console.log(hashResult)

                setError(null);
            } catch (err) {
                console.log('Error hashing file: ' + (err instanceof Error ? err.message : String(err)));

                setHashResult("ERROR");
            }
        };
        reader.onerror = () => {
            setError('Error reading file');
            setHashResult("");
        };
        reader.readAsArrayBuffer(file);
    }, []);

    const handleUpload = () => {

        // replace with test url
        fetch('http://127.0.0.1:3000/register', {
            method: 'POST',
            body: hashResult,
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
