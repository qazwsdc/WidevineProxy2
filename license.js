import { AES_CMAC } from "./cmac.js"
import {
    compareUint8Arrays,
    uint8ArrayToHex,
    uint8ArrayToString,
    stringToUint8Array,
    stringToHex,
    base64toUint8Array, uint8ArrayToBase64
} from "./util.js"
const { ClientIdentification, DrmCertificate, EncryptedClientIdentification, License, LicenseRequest, LicenseType,
    ProtocolVersion, SignedDrmCertificate, SignedMessage, WidevinePsshData } = protobuf.roots.default.license_protocol;


export const SERVICE_CERTIFICATE_CHALLENGE = new Uint8Array([0x08, 0x04]);

const WIDEVINE_SYSTEM_ID = new Uint8Array([0xed, 0xef, 0x8b, 0xa9, 0x79, 0xd6, 0x4a, 0xce, 0xa3, 0xc8, 0x27, 0xdc, 0xd5, 0x1d, 0x21, 0xed]);
const PSSH_MAGIC = new Uint8Array([0x70, 0x73, 0x73, 0x68])

const WIDEVINE_ROOT_PUBLIC_KEY = new Uint8Array([
    0x30, 0x82, 0x01, 0x8a, 0x02, 0x82, 0x01, 0x81, 0x00, 0xb4, 0xfe, 0x39, 0xc3, 0x65, 0x90, 0x03, 0xdb, 0x3c, 0x11, 0x97, 0x09, 0xe8, 0x68, 0xcd,
    0xf2, 0xc3, 0x5e, 0x9b, 0xf2, 0xe7, 0x4d, 0x23, 0xb1, 0x10, 0xdb, 0x87, 0x65, 0xdf, 0xdc, 0xfb, 0x9f, 0x35, 0xa0, 0x57, 0x03, 0x53, 0x4c, 0xf6,
    0x6d, 0x35, 0x7d, 0xa6, 0x78, 0xdb, 0xb3, 0x36, 0xd2, 0x3f, 0x9c, 0x40, 0xa9, 0x95, 0x26, 0x72, 0x7f, 0xb8, 0xbe, 0x66, 0xdf, 0xc5, 0x21, 0x98,
    0x78, 0x15, 0x16, 0x68, 0x5d, 0x2f, 0x46, 0x0e, 0x43, 0xcb, 0x8a, 0x84, 0x39, 0xab, 0xfb, 0xb0, 0x35, 0x80, 0x22, 0xbe, 0x34, 0x23, 0x8b, 0xab,
    0x53, 0x5b, 0x72, 0xec, 0x4b, 0xb5, 0x48, 0x69, 0x53, 0x3e, 0x47, 0x5f, 0xfd, 0x09, 0xfd, 0xa7, 0x76, 0x13, 0x8f, 0x0f, 0x92, 0xd6, 0x4c, 0xdf,
    0xae, 0x76, 0xa9, 0xba, 0xd9, 0x22, 0x10, 0xa9, 0x9d, 0x71, 0x45, 0xd6, 0xd7, 0xe1, 0x19, 0x25, 0x85, 0x9c, 0x53, 0x9a, 0x97, 0xeb, 0x84, 0xd7,
    0xcc, 0xa8, 0x88, 0x82, 0x20, 0x70, 0x26, 0x20, 0xfd, 0x7e, 0x40, 0x50, 0x27, 0xe2, 0x25, 0x93, 0x6f, 0xbc, 0x3e, 0x72, 0xa0, 0xfa, 0xc1, 0xbd,
    0x29, 0xb4, 0x4d, 0x82, 0x5c, 0xc1, 0xb4, 0xcb, 0x9c, 0x72, 0x7e, 0xb0, 0xe9, 0x8a, 0x17, 0x3e, 0x19, 0x63, 0xfc, 0xfd, 0x82, 0x48, 0x2b, 0xb7,
    0xb2, 0x33, 0xb9, 0x7d, 0xec, 0x4b, 0xba, 0x89, 0x1f, 0x27, 0xb8, 0x9b, 0x88, 0x48, 0x84, 0xaa, 0x18, 0x92, 0x0e, 0x65, 0xf5, 0xc8, 0x6c, 0x11,
    0xff, 0x6b, 0x36, 0xe4, 0x74, 0x34, 0xca, 0x8c, 0x33, 0xb1, 0xf9, 0xb8, 0x8e, 0xb4, 0xe6, 0x12, 0xe0, 0x02, 0x98, 0x79, 0x52, 0x5e, 0x45, 0x33,
    0xff, 0x11, 0xdc, 0xeb, 0xc3, 0x53, 0xba, 0x7c, 0x60, 0x1a, 0x11, 0x3d, 0x00, 0xfb, 0xd2, 0xb7, 0xaa, 0x30, 0xfa, 0x4f, 0x5e, 0x48, 0x77, 0x5b,
    0x17, 0xdc, 0x75, 0xef, 0x6f, 0xd2, 0x19, 0x6d, 0xdc, 0xbe, 0x7f, 0xb0, 0x78, 0x8f, 0xdc, 0x82, 0x60, 0x4c, 0xbf, 0xe4, 0x29, 0x06, 0x5e, 0x69,
    0x8c, 0x39, 0x13, 0xad, 0x14, 0x25, 0xed, 0x19, 0xb2, 0xf2, 0x9f, 0x01, 0x82, 0x0d, 0x56, 0x44, 0x88, 0xc8, 0x35, 0xec, 0x1f, 0x11, 0xb3, 0x24,
    0xe0, 0x59, 0x0d, 0x37, 0xe4, 0x47, 0x3c, 0xea, 0x4b, 0x7f, 0x97, 0x31, 0x1c, 0x81, 0x7c, 0x94, 0x8a, 0x4c, 0x7d, 0x68, 0x15, 0x84, 0xff, 0xa5,
    0x08, 0xfd, 0x18, 0xe7, 0xe7, 0x2b, 0xe4, 0x47, 0x27, 0x12, 0x11, 0xb8, 0x23, 0xec, 0x58, 0x93, 0x3c, 0xac, 0x12, 0xd2, 0x88, 0x6d, 0x41, 0x3d,
    0xc5, 0xfe, 0x1c, 0xdc, 0xb9, 0xf8, 0xd4, 0x51, 0x3e, 0x07, 0xe5, 0x03, 0x6f, 0xa7, 0x12, 0xe8, 0x12, 0xf7, 0xb5, 0xce, 0xa6, 0x96, 0x55, 0x3f,
    0x78, 0xb4, 0x64, 0x82, 0x50, 0xd2, 0x33, 0x5f, 0x91, 0x02, 0x03, 0x01, 0x00, 0x01
]);

const STAGING_PRIVACY_CERT = new Uint8Array([
    0x0a, 0xbf, 0x02, 0x08, 0x03, 0x12, 0x10, 0x28, 0x70, 0x34, 0x54, 0xc0, 0x08, 0xf6, 0x36, 0x18, 0xad, 0xe7, 0x44, 0x3d, 0xb6, 0xc4, 0xc8, 0x18,
    0x8b, 0xe7, 0xf9, 0x90, 0x05, 0x22, 0x8e, 0x02, 0x30, 0x82, 0x01, 0x0a, 0x02, 0x82, 0x01, 0x01, 0x00, 0xb5, 0x21, 0x12, 0xb8, 0xd0, 0x5d, 0x02,
    0x3f, 0xcc, 0x5d, 0x95, 0xe2, 0xc2, 0x51, 0xc1, 0xc6, 0x49, 0xb4, 0x17, 0x7c, 0xd8, 0xd2, 0xbe, 0xef, 0x35, 0x5b, 0xb0, 0x67, 0x43, 0xde, 0x66,
    0x1e, 0x3d, 0x2a, 0xbc, 0x31, 0x82, 0xb7, 0x99, 0x46, 0xd5, 0x5f, 0xdc, 0x08, 0xdf, 0xe9, 0x54, 0x07, 0x81, 0x5e, 0x9a, 0x62, 0x74, 0xb3, 0x22,
    0xa2, 0xc7, 0xf5, 0xe0, 0x67, 0xbb, 0x5f, 0x0a, 0xc0, 0x7a, 0x89, 0xd4, 0x5a, 0xea, 0x94, 0xb2, 0x51, 0x6f, 0x07, 0x5b, 0x66, 0xef, 0x81, 0x1d,
    0x0d, 0x26, 0xe1, 0xb9, 0xa6, 0xb8, 0x94, 0xf2, 0xb9, 0x85, 0x79, 0x62, 0xaa, 0x17, 0x1c, 0x4f, 0x66, 0x63, 0x0d, 0x3e, 0x4c, 0x60, 0x27, 0x18,
    0x89, 0x7f, 0x5e, 0x1e, 0xf9, 0xb6, 0xaa, 0xf5, 0xad, 0x4d, 0xba, 0x2a, 0x7e, 0x14, 0x17, 0x6d, 0xf1, 0x34, 0xa1, 0xd3, 0x18, 0x5b, 0x5a, 0x21,
    0x8a, 0xc0, 0x5a, 0x4c, 0x41, 0xf0, 0x81, 0xef, 0xff, 0x80, 0xa3, 0xa0, 0x40, 0xc5, 0x0b, 0x09, 0xbb, 0xc7, 0x40, 0xee, 0xdc, 0xd8, 0xf1, 0x4d,
    0x67, 0x5a, 0x91, 0x98, 0x0f, 0x92, 0xca, 0x7d, 0xdc, 0x64, 0x6a, 0x06, 0xad, 0xad, 0x51, 0x01, 0xf7, 0x4a, 0x0e, 0x49, 0x8c, 0xc0, 0x1f, 0x00,
    0x53, 0x2b, 0xac, 0x21, 0x78, 0x50, 0xbd, 0x90, 0x5e, 0x90, 0x92, 0x36, 0x56, 0xb7, 0xdf, 0xef, 0xef, 0x42, 0x48, 0x67, 0x67, 0xf3, 0x3e, 0xf6,
    0x28, 0x3d, 0x4f, 0x42, 0x54, 0xab, 0x72, 0x58, 0x93, 0x90, 0xbe, 0xe5, 0x58, 0x08, 0xf1, 0xd6, 0x68, 0x08, 0x0d, 0x45, 0xd8, 0x93, 0xc2, 0xbc,
    0xa2, 0xf7, 0x4d, 0x60, 0xa0, 0xc0, 0xd0, 0xa0, 0x99, 0x3c, 0xef, 0x01, 0x60, 0x47, 0x03, 0x33, 0x4c, 0x36, 0x38, 0x13, 0x94, 0x86, 0xbc, 0x9d,
    0xaf, 0x24, 0xfd, 0x67, 0xa0, 0x7f, 0x9a, 0xd9, 0x43, 0x02, 0x03, 0x01, 0x00, 0x01, 0x3a, 0x12, 0x73, 0x74, 0x61, 0x67, 0x69, 0x6e, 0x67, 0x2e,
    0x67, 0x6f, 0x6f, 0x67, 0x6c, 0x65, 0x2e, 0x63, 0x6f, 0x6d, 0x12, 0x80, 0x03, 0x98, 0x3e, 0x30, 0x35, 0x26, 0x75, 0xf4, 0x0b, 0xa7, 0x15, 0xfc,
    0x24, 0x9b, 0xda, 0xe5, 0xd4, 0xac, 0x72, 0x49, 0xa2, 0x66, 0x65, 0x21, 0xe4, 0x36, 0x55, 0x73, 0x95, 0x29, 0x72, 0x1f, 0xf8, 0x80, 0xe0, 0xaa,
    0xef, 0xc5, 0xe2, 0x7b, 0xc9, 0x80, 0xda, 0xea, 0xda, 0xbf, 0x3f, 0xc3, 0x86, 0xd0, 0x84, 0xa0, 0x2c, 0x82, 0x53, 0x78, 0x48, 0xcc, 0x75, 0x3f,
    0xf4, 0x97, 0xb0, 0x11, 0xa7, 0xda, 0x97, 0x78, 0x8a, 0x00, 0xe2, 0xaa, 0x6b, 0x84, 0xcd, 0x7d, 0x71, 0xc0, 0x7a, 0x48, 0xeb, 0xf6, 0x16, 0x02,
    0xcc, 0xa5, 0xa3, 0xf3, 0x20, 0x30, 0xa7, 0x29, 0x5c, 0x30, 0xda, 0x91, 0x5b, 0x91, 0xdc, 0x18, 0xb9, 0xbc, 0x95, 0x93, 0xb8, 0xde, 0x8b, 0xb5,
    0x0f, 0x0d, 0xed, 0xc1, 0x29, 0x38, 0xb8, 0xe9, 0xe0, 0x39, 0xcd, 0xde, 0x18, 0xfa, 0x82, 0xe8, 0x1b, 0xb0, 0x32, 0x63, 0x0f, 0xe9, 0x55, 0xd8,
    0x5a, 0x56, 0x6c, 0xe1, 0x54, 0x30, 0x0b, 0xf6, 0xd4, 0xc1, 0xbd, 0x12, 0x69, 0x66, 0x35, 0x6b, 0x28, 0x7d, 0x65, 0x7b, 0x18, 0xce, 0x63, 0xd0,
    0xef, 0xd4, 0x5f, 0xc5, 0x26, 0x9e, 0x97, 0xea, 0xb1, 0x1c, 0xb5, 0x63, 0xe5, 0x56, 0x43, 0xb2, 0x6f, 0xf4, 0x9f, 0x10, 0x9c, 0x21, 0x01, 0xaf,
    0xca, 0xf3, 0x5b, 0x83, 0x2f, 0x28, 0x8f, 0x0d, 0x9d, 0x45, 0x96, 0x0e, 0x25, 0x9e, 0x85, 0xfb, 0x5d, 0x24, 0xdb, 0xd2, 0xcf, 0x82, 0x76, 0x4c,
    0x5d, 0xd9, 0xbf, 0x72, 0x7e, 0xfb, 0xe9, 0xc8, 0x61, 0xf8, 0x69, 0x32, 0x1f, 0x6a, 0xde, 0x18, 0x90, 0x5f, 0x4d, 0x92, 0xf9, 0xa6, 0xda, 0x65,
    0x36, 0xdb, 0x84, 0x75, 0x87, 0x1d, 0x16, 0x8e, 0x87, 0x0b, 0xb2, 0x30, 0x3c, 0xf7, 0x0c, 0x6e, 0x97, 0x84, 0xc9, 0x3d, 0x2d, 0xe8, 0x45, 0xad,
    0x82, 0x62, 0xbe, 0x7e, 0x0d, 0x4e, 0x2e, 0x4a, 0x07, 0x59, 0xce, 0xf8, 0x2d, 0x10, 0x9d, 0x25, 0x92, 0xc7, 0x24, 0x29, 0xf8, 0xc0, 0x17, 0x42,
    0xba, 0xe2, 0xb3, 0xde, 0xca, 0xdb, 0xc3, 0x3c, 0x3e, 0x5f, 0x4b, 0xaf, 0x5e, 0x16, 0xec, 0xb7, 0x4e, 0xad, 0xba, 0xfc, 0xb7, 0xc6, 0x70, 0x5f,
    0x7a, 0x9e, 0x3b, 0x6f, 0x39, 0x40, 0x38, 0x3f, 0x9c, 0x51, 0x16, 0xd2, 0x02, 0xa2, 0x0c, 0x92, 0x29, 0xee, 0x96, 0x9c, 0x25, 0x19, 0x71, 0x83,
    0x03, 0xb5, 0x0d, 0x01, 0x30, 0xc3, 0x35, 0x2e, 0x06, 0xb0, 0x14, 0xd8, 0x38, 0x54, 0x0f, 0x8a, 0x0c, 0x22, 0x7c, 0x00, 0x11, 0xe0, 0xf5, 0xb3,
    0x8e, 0x4e, 0x29, 0x8e, 0xd2, 0xcb, 0x30, 0x1e, 0xb4, 0x56, 0x49, 0x65, 0xf5, 0x5c, 0x5d, 0x79, 0x75, 0x7a, 0x25, 0x0a, 0x4e, 0xb9, 0xc8, 0x4a,
    0xb3, 0xe6, 0x53, 0x9f, 0x6b, 0x6f, 0xdf, 0x56, 0x89, 0x9e, 0xa2, 0x99, 0x14
])


export class Session {
    constructor(contentDecryptionModule, pssh) {
        this._devicePrivateKey = forge.pki.privateKeyFromPem(
            contentDecryptionModule.privateKey
        )
        this._identifierBlob = ClientIdentification.decode(
            contentDecryptionModule.identifierBlob
        )
        if (typeof pssh === "string") {
            pssh = base64toUint8Array(pssh)
        }
        this._pssh = pssh
    }

    async setDefaultServiceCertificate() {
        await this.setServiceCertificate(STAGING_PRIVACY_CERT)
    }

    async setServiceCertificateFromMessage(rawSignedMessage) {
        const signedMessage = SignedMessage.decode(new Uint8Array(rawSignedMessage))
        if (!signedMessage.msg) {
            throw new Error(
                "the service certificate message does not contain a message"
            )
        }
        await this.setServiceCertificate(signedMessage.msg)
    }

    async setServiceCertificate(serviceCertificate) {
        const signedServiceCertificate = SignedDrmCertificate.decode(
            serviceCertificate
        )
        if (!(await this._verifyServiceCertificate(signedServiceCertificate))) {
            throw new Error(
                "Service certificate is not signed by the Widevine root certificate"
            )
        }
        this._serviceCertificate = signedServiceCertificate
    }

    createLicenseRequest(licenseType = LicenseType.STREAMING, android = false) {
        if (compareUint8Arrays(this._pssh.subarray(4, 8), PSSH_MAGIC)) {
            if (compareUint8Arrays(this._pssh.subarray(12, 28), WIDEVINE_SYSTEM_ID)) {
                this._pssh = this._pssh.subarray(32)
            } else {
                throw new Error(`Invalid System ID in PSSH Box: ${uint8ArrayToHex(this._pssh.subarray(12, 28))}`)
            }
        }

        const pssh = this._parseWidevinePsshData(this._pssh)
        if (!pssh) {
            throw new Error("Invalid WidevinePsshData found")
        }

        const request_id = android ? this._generateAndroidIdentifier() : this._generateGenericIdentifier();
        const licenseRequest = new LicenseRequest({
            type: LicenseRequest.RequestType.NEW,
            contentId: new LicenseRequest.ContentIdentification({
                widevinePsshData: new LicenseRequest.ContentIdentification.WidevinePsshData({
                    psshData: [this._pssh],
                    licenseType: licenseType,
                    requestId: request_id
                })
            }),
            requestTime: Math.floor(Date.now() / 1000), // BigInt(Date.now()) / BigInt(1000),
            protocolVersion: ProtocolVersion.VERSION_2_1,
            keyControlNonce: Math.floor(Math.random() * 2 ** 31)
        })

        if (this._serviceCertificate) {
            licenseRequest.encryptedClientId = this._encryptClientIdentification(
                this._identifierBlob,
                this._serviceCertificate
            )
        } else {
            licenseRequest.clientId = this._identifierBlob
        }

        this._rawLicenseRequest = LicenseRequest.encode(licenseRequest).finish()

        const pss = forge.pss.create({
            md: forge.md.sha1.create(),
            mgf: forge.mgf.mgf1.create(forge.md.sha1.create()),
            saltLength: 20
        })

        const md = forge.md.sha1.create()
        md.update(uint8ArrayToString(this._rawLicenseRequest), "raw")

        const signature = stringToUint8Array(this._devicePrivateKey.sign(md, pss))
        const signedLicenseRequest = new SignedMessage({
            type: SignedMessage.MessageType.LICENSE_REQUEST,
            msg: this._rawLicenseRequest,
            signature: signature
        })

        return [SignedMessage.encode(signedLicenseRequest).finish(), request_id]
    }

    async parseLicense(rawLicense) {
        if (!this._rawLicenseRequest) {
            throw new Error("please request a license first")
        }

        const signedLicense = SignedMessage.decode(new Uint8Array(rawLicense))
        if (!signedLicense.sessionKey) {
            throw new Error("the license does not contain a session key")
        }
        if (!signedLicense.msg) {
            throw new Error("the license does not contain a message")
        }
        if (!signedLicense.signature) {
            throw new Error("the license does not contain a signature")
        }

        const sessionKey = this._devicePrivateKey.decrypt(
            uint8ArrayToString(signedLicense.sessionKey),
            "RSA-OAEP",
            {
                md: forge.md.sha1.create()
            }
        )

        const cmac = new AES_CMAC(stringToUint8Array(sessionKey))
        const encKeyBase = new Uint8Array([
            ...stringToUint8Array("ENCRYPTION"),
            ...new Uint8Array([0x00]),
            ...this._rawLicenseRequest,
            ...new Uint8Array([0x00, 0x00, 0x00, 0x80])
        ])
        const authKeyBase = new Uint8Array([
            ...stringToUint8Array("AUTHENTICATION"),
            ...new Uint8Array([0x00]),
            ...this._rawLicenseRequest,
            ...new Uint8Array([0x00, 0x00, 0x02, 0x00])
        ])

        const encKey = await cmac.calculate(
            new Uint8Array([
                ...new Uint8Array([0x01]),
                ...encKeyBase
            ])
        )

        const server_key_1 = await cmac.calculate(new Uint8Array([
            ...new Uint8Array([0x01]),
            ...authKeyBase
        ]))
        const server_key_2 = await cmac.calculate(new Uint8Array([
            ...new Uint8Array([0x02]),
            ...authKeyBase
        ]))
        const serverKey = new Uint8Array([
            ...new Uint8Array(server_key_1),
            ...new Uint8Array(server_key_2)
        ])

        const hmac = forge.hmac.create()
        hmac.start(forge.md.sha256.create(), uint8ArrayToString(serverKey), "raw")
        hmac.update(uint8ArrayToString(signedLicense.msg))
        const calculatedSignature = stringToUint8Array(hmac.digest().data)

        if (!compareUint8Arrays(calculatedSignature, signedLicense.signature)) {
            throw new Error("signatures do not match")
        }

        const license = License.decode(signedLicense.msg)

        const keyContainers = license.key.map(keyContainer => {
            if (keyContainer.type && keyContainer.type === 2 && keyContainer.key && keyContainer.iv) {
                const keyBuffer = forge.util.createBuffer(encKey, 'raw');
                const decipher = forge.cipher.createDecipher(
                    "AES-CBC",
                    keyBuffer
                )

                decipher.start({
                    iv: uint8ArrayToString(keyContainer.iv)
                })
                decipher.update(forge.util.createBuffer(keyContainer.key))
                decipher.finish()

                return {
                    kid: keyContainer.id.length !== 0 ? uint8ArrayToHex(keyContainer.id) : "00000000000000000000000000000000",
                    k: stringToHex(decipher.output.data)
                }
            }
        })
        const valid_containers = keyContainers.filter(container => !!container);
        if (valid_containers.length < 1) {
            throw new Error("there was not a single valid key in the response")
        }
        return valid_containers;
    }

    _encryptClientIdentification(clientIdentification, signedServiceCertificate) {
        if (!signedServiceCertificate.drmCertificate) {
            throw new Error(
                "the service certificate does not contain an actual certificate"
            )
        }

        const serviceCertificate = DrmCertificate.decode(
            signedServiceCertificate.drmCertificate
        )
        console.log("[WidevineProxy2]", "SERVICE_CERTIFICATE", serviceCertificate);

        if (!serviceCertificate.publicKey) {
            throw new Error("the service certificate does not contain a public key")
        }

        const key = forge.random.getBytesSync(16)
        const iv = forge.random.getBytesSync(16)

        const cipher = forge.cipher.createCipher("AES-CBC", key)
        cipher.start({
            iv: iv
        })
        cipher.update(
            forge.util.createBuffer(
                ClientIdentification.encode(clientIdentification).finish()
            )
        )
        cipher.finish()
        const rawEncryptedClientIdentification = stringToUint8Array(cipher.output.data)

        const publicKey = forge.pki.publicKeyFromAsn1(
            forge.asn1.fromDer(
                uint8ArrayToString(serviceCertificate.publicKey)
            )
        )
        const encryptedKey = publicKey.encrypt(key, "RSA-OAEP", {
            md: forge.md.sha1.create()
        })

        return new EncryptedClientIdentification({
            encryptedClientId: rawEncryptedClientIdentification,
            encryptedClientIdIv: stringToUint8Array(iv),
            encryptedPrivacyKey: stringToUint8Array(encryptedKey),
            providerId: serviceCertificate.providerId,
            serviceCertificateSerialNumber: serviceCertificate.serialNumber
        })
    }

    async _verifyServiceCertificate(signedServiceCertificate) {
        if (!signedServiceCertificate.drmCertificate) {
            throw new Error(
                "the service certificate does not contain an actual certificate"
            )
        }
        if (!signedServiceCertificate.signature) {
            throw new Error("the service certificate does not contain a signature")
        }

        const pss = forge.pss.create({
            md: forge.md.sha1.create(),
            mgf: forge.mgf.mgf1.create(forge.md.sha1.create()),
            saltLength: 20
        })

        const sha1 = forge.md.sha1.create()
        sha1.update(
            uint8ArrayToString(signedServiceCertificate.drmCertificate),
            "raw"
        )

        const publicKey = forge.pki.publicKeyFromAsn1(
            forge.asn1.fromDer(
                uint8ArrayToString(WIDEVINE_ROOT_PUBLIC_KEY)
            )
        )

        return publicKey.verify(
            sha1.digest().bytes(),
            uint8ArrayToString(signedServiceCertificate.signature),
            pss
        )
    }

    _parseWidevinePsshData(pssh) {
        try {
            return WidevinePsshData.decode(pssh)
        } catch {
            return null
        }
    }

    _generateAndroidIdentifier() {
        return stringToUint8Array(`${forge.util.bytesToHex(forge.random.getBytesSync(8))}0100000000000000`)
    }

    _generateGenericIdentifier() {
        return forge.random.getBytesSync(16)
    }

    getPSSH() {
        return uint8ArrayToBase64(this._pssh);
    }
}
