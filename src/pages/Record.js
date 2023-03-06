/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */

import React, { useState, useEffect } from 'react'

function AudioRecorder() {
  const [recording, setRecording] = useState(false) // 녹음 여부
  const [mediaRecorder, setMediaRecorder] = useState(null) // stream을 녹음하는 객체
  const [audioChunks, setAudioChunks] = useState([])
  const [audioLevel, setAudioLevel] = useState(0) // 성량

  const startRecording = async() => {
    const audioContext = new AudioContext()

    // get a MediaStream object from a user's microphone
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        setRecording(true)
        const mediaRecorder = new MediaRecorder(stream)
        setMediaRecorder(mediaRecorder)
        mediaRecorder.addEventListener('dataavailable', handleDataAvailable)
        mediaRecorder.start()

        // create a new MediaStreamAudioSourceNode object from the MediaStream
        const sourceNode = audioContext.createMediaStreamSource(stream)

        // create a new AnalyserNode object
        const analyserNode = audioContext.createAnalyser()
        analyserNode.fftSize = 256

        // connect the sourceNode to the analyserNode
        sourceNode.connect(analyserNode)

        // create a new Uint8Array to store the frequency data
        const dataArray = new Uint8Array(analyserNode.frequencyBinCount)

        // create a new function to get the audio level
        function getAudioLevel() {
          analyserNode.getByteFrequencyData(dataArray)
          const avg = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length
          return avg
        }

        // update the audio level state every 100ms
        const intervalId = setInterval(() => {
          setAudioLevel(getAudioLevel())
        }, 100)

        // return a cleanup function to stop the interval and disconnect the nodes
        return () => {
          clearInterval(intervalId)
          sourceNode.disconnect()
          analyserNode.disconnect()
        }
      })
      .catch((error) => {
        console.log(error)
      })
  }

  const stopRecording = () => {
    if (!mediaRecorder) return
    mediaRecorder.stop()
    setRecording(false)
    console.log('recording 종료 =============================================================')
  }

  const handleDataAvailable = (event) => {
    if (event.data.size > 0) {
      setAudioChunks((chunks) => [...chunks, event.data])
    }
  }

  const downloadAudio = () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
    const audioUrl = URL.createObjectURL(audioBlob)
    const link = document.createElement('a')
    link.href = audioUrl
    link.download = 'recording.wav'
    link.click()
    setAudioChunks([])
  }

  return (
      <div>
        <button onClick={startRecording} disabled={recording}>
          Start Recording
        </button>
        <button onClick={stopRecording} disabled={!recording}>
          Stop Recording
        </button>
        <button onClick={downloadAudio} disabled={audioChunks.length === 0}>
          Download Recording
        </button>
        <div>Audio Level: {audioLevel.toFixed(2)}</div>
      </div>
  )
}

export default AudioRecorder
