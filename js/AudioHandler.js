class AudioHandler {
    constructor() {
        // hnmm
    }
    
    initialize(stream) {
        this.ctx = new AudioContext();
        this.mic = this.ctx.createMediaStreamSource(stream);
        this.analyzer = this.ctx.createAnalyser();
    
        this.mic.connect(this.analyzer);
    
        this.rawPitchData = new Uint8Array(this.analyzer.frequencyBinCount); // float vs byte?
    }

    getFrequencySpectrum() {
        this.analyzer.getByteFrequencyData(this.rawPitchData);
        return this.rawPitchData;
    }

    getFrequencySpectrumPairs() {
        this.analyzer.getByteFrequencyData(this.rawPitchData);
        const pairArray = [];

        for (let i = 0; i < this.rawPitchData.length; i++) {
            let freq = i * this.ctx.sampleRate / this.analyzer.fftSize;
            pairArray.push([freq, this.rawPitchData[i]]);
        }

        return pairArray;
    }

    // lite dubbelkod
    getHarmonicSpectrumPairs() {
        // put updated frequency data in rawPitchData
        this.analyzer.getByteFrequencyData(this.rawPitchData);

        let harmonicProductSpectrum = Array.from(this.rawPitchData);

        // tots great code
        const half   = this.simpleDownSample(this.rawPitchData, 2);
        const third  = this.simpleDownSample(this.rawPitchData, 3);
        const fourth = this.simpleDownSample(this.rawPitchData, 4);
        const fifth  = this.simpleDownSample(this.rawPitchData, 5);
        
        for (let i = 0; i < fifth.length; i++) {
            harmonicProductSpectrum[i] *= half[i] * third[i] * fourth[i] * fifth[i];
        }


        const pairArray = [];

        for (let i = 0; i < harmonicProductSpectrum.length; i++) {
            let freq = i * this.ctx.sampleRate / this.analyzer.fftSize;
            pairArray.push([freq, harmonicProductSpectrum[i]]);
        }

        return pairArray;
    }

    getStrongestFrequency() {
        this.analyzer.getByteFrequencyData(this.rawPitchData);

        let strongest = 0;
        for (let i = 0; i < this.analyzer.frequencyBinCount; i++) {
            if (this.rawPitchData[i] > this.rawPitchData[strongest]) {
                strongest = i;
            }
        }

        // return frequency in Hz
        return (strongest * this.ctx.sampleRate / this.analyzer.fftSize);
    }
    
    // not super accurate
    getPitch() {
        // put updated frequency data in rawPitchData
        this.analyzer.getByteFrequencyData(this.rawPitchData);

        let harmonicProductSpectrum = Array.from(this.rawPitchData);

        // tots great code
        const half   = this.simpleDownSample(this.rawPitchData, 2);
        const third  = this.simpleDownSample(this.rawPitchData, 3);
        const fourth = this.simpleDownSample(this.rawPitchData, 4);
        const fifth  = this.simpleDownSample(this.rawPitchData, 5);
        
        for (let i = 0; i < fifth.length; i++) {
            harmonicProductSpectrum[i] *= half[i] * third[i] * fourth[i] * fifth[i];
        }

        // find stronges freq after HPS
        let strongest = 0;
        for (let i = 0; i < this.analyzer.frequencyBinCount; i++) {
            if (harmonicProductSpectrum[i] > harmonicProductSpectrum[strongest]) {
                strongest = i;
            }
        }

        // return frequency in Hz, TODO double check with spec maybe
        return (strongest * this.ctx.sampleRate / this.analyzer.fftSize);
    }


    // downsamples array by removing samples
    // returns an array with every 'factor' item from 'inputArray' starting at 0
    simpleDownSample(inputArray, factor) {
        const newArray = [];

        for (let i = 0; i < inputArray.length; i++) {
            if (i % factor === 0) { 
                newArray.push(inputArray[i]);
            }
        }

        return newArray;
    }
}