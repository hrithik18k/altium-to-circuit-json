import { resolve } from "node:path"

export interface DirectReferenceSpec {
  filename: string
  sha256: string
  source: string
  url: string
}

export interface ZipOutputSpec {
  archivePath: string
  filename: string
  sha256: string
}

export interface NestedZipSpec {
  archivePath: string
  outputs: ZipOutputSpec[]
  sha256: string
}

export interface ZipBundleSpec {
  archiveSha256: string
  nestedArchives: NestedZipSpec[]
  outputs: ZipOutputSpec[]
  source: string
  url: string
}

export const REFERENCE_OUTPUT_DIRECTORY = resolve(
  import.meta.dir,
  "../../tests/fixtures/downloaded",
)

export const TI_TMDS62LEVM_FIXTURE_NAME = "ti-tmds62levm-rev-b"
export const TI_TMDS62LEVM_PCB_FILENAME = `${TI_TMDS62LEVM_FIXTURE_NAME}.PcbDoc`
export const TI_TMDS62LEVM_SCHEMATIC_SHEET_NUMBERS = Array.from(
  { length: 57 },
  (_, index) => String(index + 1).padStart(2, "0"),
)

export const TI_POWER_REFERENCE_PCB_FILENAMES = {
  pmp22650: "ti-pmp22650-main.PcbDoc",
  pmp22712: "ti-pmp22712.PcbDoc",
  pmp22773: "ti-pmp22773.PcbDoc",
  pmp23595: "ti-pmp23595.PcbDoc",
  pmp23653Main: "ti-pmp23653-main.PcbDoc",
  pmp23653PlanarTransformer: "ti-pmp23653-planar-transformer.PcbDoc",
} as const

export const TI_EVM_REFERENCE_FILENAMES = {
  dp83825Evm: {
    pcb: "ti-dp83825evm.PcbDoc",
  },
  drv8307Evm: {
    pcb: "ti-drv8307evm.PcbDoc",
    project: "ti-drv8307evm.PrjPcb",
    schematic: "ti-drv8307evm.SchDoc",
  },
  lm251772EvmPd: {
    hardwareSchematic: "ti-lm251772evm-pd-hardware.SchDoc",
    pcb: "ti-lm251772evm-pd.PcbDoc",
    project: "ti-lm251772evm-pd.PrjPcb",
    schematic: "ti-lm251772evm-pd.SchDoc",
  },
  lm5155EvmFly: {
    hardwareSchematic: "ti-lm5155evm-fly-hardware.SchDoc",
    pcb: "ti-lm5155evm-fly.PcbDoc",
    project: "ti-lm5155evm-fly.PrjPcb",
    schematic: "ti-lm5155evm-fly.SchDoc",
  },
  lmg342xBbEvm: {
    hardwareSchematic: "ti-lmg342x-bb-evm-hardware.SchDoc",
    pcb: "ti-lmg342x-bb-evm.PcbDoc",
    project: "ti-lmg342x-bb-evm.PrjPcb",
    schematic: "ti-lmg342x-bb-evm.SchDoc",
  },
} as const

export const DIRECT_REFERENCES: DirectReferenceSpec[] = [
  {
    filename: "ch582.PcbDoc",
    sha256: "dcf82249e19f9a58f3874e9c56509bab42f3fdf00dc3dd0d52ba9a4f4aeb0649",
    source:
      "iot-lorawan/CH582_PCB_SCH@b65bce802295c6c40413c5bc3ea54682820619c1 (MIT)",
    url: "https://raw.githubusercontent.com/iot-lorawan/CH582_PCB_SCH/b65bce802295c6c40413c5bc3ea54682820619c1/PCB_ch582_2022-06-16.pcbdoc",
  },
  {
    filename: "simplefocmini-2024-04-26.PcbDoc",
    sha256: "8328cebe97ba8623fb2b707490e3473c6f7dc13fb0502b596b0e40c7e1613d24",
    source:
      "simplefoc/SimpleFOCMini@8e10d4ba398624bd0ef970e82c03d7a6bcc2220d (MIT)",
    url: "https://raw.githubusercontent.com/simplefoc/SimpleFOCMini/8e10d4ba398624bd0ef970e82c03d7a6bcc2220d/Altium/simplefocmini_2024-04-26.pcbdoc",
  },
  {
    filename: "sample-board-design.PcbDoc",
    sha256: "745a27e3b876767c9bc4caf7706c19b6f97b3313efdb00bc2771f22db8410174",
    source:
      "monkslc/hyperpolyglot@a55a3b58eaed09b4314ef93d78e50a80cfec36f4 (Apache-2.0)",
    url: "https://raw.githubusercontent.com/monkslc/hyperpolyglot/a55a3b58eaed09b4314ef93d78e50a80cfec36f4/samples/Altium%20Designer/Sample%20Board%20Design.PcbDoc",
  },
  {
    filename: "nodemcu-esp12.PcbDoc",
    sha256: "5060fb6f0e80af09c8d5af376038a4e55044b28ae1d4dfa6a1fa354a6ea1e2f2",
    source:
      "nodemcu/nodemcu-devkit@b0f19d6d1c49b6db4aef56ddba789a7f92f6ecce (MIT)",
    url: "https://raw.githubusercontent.com/nodemcu/nodemcu-devkit/b0f19d6d1c49b6db4aef56ddba789a7f92f6ecce/NODEMCU_ESP12.PcbDoc",
  },
  {
    filename: "ebaz4205.PcbDoc",
    sha256: "1dbeba2537bdf83e77bc9c5a7a6f2f7bf1104193f3dc2547d020dbd8018b4e62",
    source: "xjtuecho/EBAZ4205@05cdb45035a06fc5b4db16babf0ac6f4ee4497be (MIT)",
    url: "https://raw.githubusercontent.com/xjtuecho/EBAZ4205/05cdb45035a06fc5b4db16babf0ac6f4ee4497be/HW/ebaz4205/altium/ebit_ad.PcbDoc",
  },
  {
    filename: "heron-payload-ssm.PcbDoc",
    sha256: "47a72219ab21c8eebb5beeab97e8aeca2121efb8561fca1d5f732215d233575d",
    source:
      "utat-ss/HERON-pcbs@7ce0d62ee6159ad9d74eb4ae941792dc0e2e4820 (CERN-OHL-P)",
    url: "https://raw.githubusercontent.com/utat-ss/HERON-pcbs/7ce0d62ee6159ad9d74eb4ae941792dc0e2e4820/payload/pay-ssm/pay-ssm-v3.PcbDoc",
  },
  {
    filename: "simplefoc-shield-v3.PcbDoc",
    sha256: "507a0feb04cf539edd110ff1fe6da8ca8025009140b1934a6fc4df78308bfec5",
    source:
      "simplefoc/Arduino-SimpleFOCShield@2a83626b86debd5fc5f309ba06b3fb36e3b25533 (MIT)",
    url: "https://raw.githubusercontent.com/simplefoc/Arduino-SimpleFOCShield/2a83626b86debd5fc5f309ba06b3fb36e3b25533/altium/SimpleFOCShieldV3.PcbDoc_2024-06-23.pcbdoc",
  },
  {
    filename: "simplefocmini-2024-04-26.SchDoc",
    sha256: "bc2039ef59eabe030fea68eedb87e3924c8e6711fb774e2d80b880cf468100ef",
    source:
      "simplefoc/SimpleFOCMini@8e10d4ba398624bd0ef970e82c03d7a6bcc2220d (MIT)",
    url: "https://raw.githubusercontent.com/simplefoc/SimpleFOCMini/8e10d4ba398624bd0ef970e82c03d7a6bcc2220d/Altium/simplefocmini_2024-04-26.schdoc",
  },
  {
    filename: "nodemcu-esp12.SchDoc",
    sha256: "cd415e8afcc7b47f2a0d7acf1e3a41d2304c4c4f02a70744d710ce24ba09707d",
    source:
      "nodemcu/nodemcu-devkit@b0f19d6d1c49b6db4aef56ddba789a7f92f6ecce (MIT)",
    url: "https://raw.githubusercontent.com/nodemcu/nodemcu-devkit/b0f19d6d1c49b6db4aef56ddba789a7f92f6ecce/NODEMCU_ESP12.SchDoc",
  },
  {
    filename: "heron-pay-ssm-top.SchDoc",
    sha256: "948eca8d0b9e306909755c11ad94d84eda7e60164d7ecc848dfbe8b77cdc2903",
    source:
      "utat-ss/HERON-pcbs@7ce0d62ee6159ad9d74eb4ae941792dc0e2e4820 (CERN-OHL-P)",
    url: "https://raw.githubusercontent.com/utat-ss/HERON-pcbs/7ce0d62ee6159ad9d74eb4ae941792dc0e2e4820/payload/pay-ssm/TOP.SchDoc",
  },
  {
    filename: "simplefoc-shield-v3.SchDoc",
    sha256: "84419ed6b8755c6490415cf3e439405d0d10a5855304db7ca8e8052f2add3af8",
    source:
      "simplefoc/Arduino-SimpleFOCShield@2a83626b86debd5fc5f309ba06b3fb36e3b25533 (MIT)",
    url: "https://raw.githubusercontent.com/simplefoc/Arduino-SimpleFOCShield/2a83626b86debd5fc5f309ba06b3fb36e3b25533/altium/SimpleFOCShieldV3.SchDoc_2024-06-23.schdoc",
  },
  {
    filename: "heron-systems-pcb.SchDoc",
    sha256: "2fd2d93806602a290cfc9afd7d523ac0f4faa8e5d993d70537f070e850fd6d6b",
    source:
      "utat-ss/HERON-pcbs@7ce0d62ee6159ad9d74eb4ae941792dc0e2e4820 (CERN-OHL-P)",
    url: "https://raw.githubusercontent.com/utat-ss/HERON-pcbs/7ce0d62ee6159ad9d74eb4ae941792dc0e2e4820/systems/systems_pcb/systems_pcb.SchDoc",
  },
]

const tiSchematicHashes: Record<string, string> = {
  "01": "3daedf995eb3c49c946360417c4a44ab834b437425709422f7f56d5355d38cf9",
  "02": "0f81da15cdd3b4c86749403f0cdf185d8c342addd8dcec23219abb5f380fbd76",
  "03": "dfb9bba2ada9767ed9e79de2a158cc029808ce1f53d75e43a2a85f2c5fdc6242",
  "04": "d19698c9ea72b4c54ef1c2eb9e15f980e6ea6b85a1b3555a41fce56608639740",
  "05": "bf2560e9c0bd9a8f347f9ecdeca9e28ae067c921fdef3b5d8b59f4f4697c09a4",
  "06": "f4f9b511c9c32f887b9698301a1c2cbf86e7567c1932a3fafedfbedcb786d813",
  "07": "38f2924d0104586c5703e5b218db26d1e96fddc3269c16da7d8fff4889afd1f8",
  "08": "fc3bf5e6fd9e9d49a6eb71f56386f10c8d69484c2a5ad57a9fa48a300a94f44d",
  "09": "07c0fdd45dff857276eab3cb605977cd0ae6f6599f0c4b460a22e782b3bc6c2b",
  "10": "c77dc2008904150dc34e9f939ad2644a481f06b8bb3c633455f4f0498b786dcb",
  "11": "f650f5d0f85917d37370fc5c5151c6b36bd8c556cd15045726afb4b5b07af1e9",
  "12": "f217da8b6b06e994fb723841af970239bfaee938ddb6d50a7332b353f7c66114",
  "13": "ddf9a5db07ad469acac778f2d2b5d32efbe164b5428f62202a37d44f009e323a",
  "14": "bbefcd9ce867c064ceb926dfb01f72d4f47480abd93045219c4594125fbb2b61",
  "15": "e7db38c1a7ba90636e613a03f2794791b4c28c590dadfafbd10b424cbe4785c2",
  "16": "dc87ca4eb6720fd094113e4f2fb8432bc1ac2f9b102d2bd6f17fe179af153eca",
  "17": "dae919e65c9e0c2d26cb6843701ad41ab4ee676bf7e6df5b97ad6e4586b2a9a3",
  "18": "6b269af7c77c5af888f7a19440465c60c3f0d6b69687ad930d879427193cef3b",
  "19": "35179900cbc314d1d61ae8512d175d6ad523f248fa3bf9a2c20654b5e87ca0ed",
  "20": "187d544764524cdeb6640a88ad23fb64e545ed0a114135349f54e35678765aff",
  "21": "497c9a1cae3007906b05eec05162f82e752dac41518e3d70ff13d79ca3819958",
  "22": "ff055e8872819658311dbb548e7288d017a9ded26644abe1b38af1e5cc724f15",
  "23": "bd0d160b8b89f2ecdb2d8d4fd2b69811f81696a7c14366cc795ba53f26c58666",
  "24": "c5a358315a556bb8dcd0a4cfff04dc8948ec84c3f89c4648ba3cc7ca43d5a502",
  "25": "10cc960fa46a38fb2a03dc1379d4302ce5381e3248cddbecc4ecbffa2e9bbc71",
  "26": "292f97168da7f7e2e023ad45f429e9570911471c7e1276d3bcfa218c66304c79",
  "27": "4669023a126654b585ccb669372ec06bb1586bf987e081bf11d5db464374fa23",
  "28": "bcd9cc4a5599b15f5f024bb4d37e96c498815560301c9039a86c00d4bcbe27d9",
  "29": "6d437dfaa3125dbb4cc1198465b5dd9db1105beea1c0ccb7a3ebf4af42230d7f",
  "30": "12d72ef1323bfb791898f0a95319e2dfd15066b3eb36bdffa13ca2e4dad754d2",
  "31": "94299862e4a77f2cdfa3f318011e67a8a4b8fdf013fb82a6b8181baddb3c1cb8",
  "32": "d64312376eb9358d6d69b4acf3ffd8cc16841e74538e7568b3d000e256dcc672",
  "33": "98c806b8856fa26186e3debf2ec763a59b95f0c2327e6c79a3f2717c150192f6",
  "34": "fb897c981983ca7dbbe9454f61a59199f3a7b689ac0666d28f7d8087b4272258",
  "35": "43ad337a7ed0b2c4259274ec196854bd1305775043f0efbf4dcc32e26ff91f4f",
  "36": "61581372bd6ffd46f34f178d94c4837ebdf212d3ae0a59f3bc6566ae007a8a6f",
  "37": "9f46d29964b739cf34f57cff3a65d537f12853fb3dcb7f3edd92588d8bcab758",
  "38": "fdc3e37d5207dc0ddd272933d9d772988bb0ba9fb115aeee1f9397781cbd0dcf",
  "39": "9962382fe121415dc5b8966f52246e1aaf88bb68af6f14614cfb3bdefd3faee7",
  "40": "3b59032dabbd2253cd69ba15e5b6545e1061eb0f7f1eb188270dbb4af782ac2b",
  "41": "20aa502d9003ff1bd17c8fe1a863117ac4359a01e8793181f84ca1c28f87b4a7",
  "42": "7f9ebe5b79c29839f92eb99b0706f641cfa802e6fef1b2b75c3a521c6bdef99c",
  "43": "d53baffa579676e31aa77adcf460b0b16f8f2ee1de111356a0b37b45007d0e7a",
  "44": "17d59b06159408d0a4b80dcb6e42fa9de2d5a9bcc9f876b3fa116af277c4d35d",
  "45": "aacf69e49e0dcb942de7a42039254a1b954522c003ab343f148266575401b4b1",
  "46": "e441dd979dc65b6d9f3e2c004cd4e9f1d5d7f24048e5208904c5517daa111a00",
  "47": "7f954a1134d7a8db2b47970b14538c6e1ad9ec1a5f40eb4c0fa51d0b7ec7aa23",
  "48": "6f4d2183e46951fcdd9a39fbac077892da455ebe75ce5a0e437f273f08f4fca1",
  "49": "de2896a91d1171c3f3d95c2cce877458f075f554553cc2c6cec4d90730858cad",
  "50": "8348a4c5148b3288a9b8c401caea8264c35cdd9792339f27c87b65df485f12da",
  "51": "a5b5f9feaf4d585ce28e2b9ca3e47bf854dd982ec11b8692531d60d52de0df15",
  "52": "09476a05905bf22fde1bbcf630602a9e13a04547bf56df49a3a27aff4b194214",
  "53": "d7281ad4c8f64086da1d35415f226d211f58f595832d0fa1228892b1b4a91513",
  "54": "d3cbeaeeade0c3cb0e75ad7a14b28476ebff83f289c2c76c9500e534f729d591",
  "55": "5d1e475cf86dde5d9e62f87becb64717b15012e824929448ed525bce925c9698",
  "56": "c875b2e89da73c75c302276a254b5adef7b27a7ba85a92d4f884d6e44dd662d1",
  "57": "8505b9f046ebae2d6bd8c9df7464928a73867e123d1bf760477e9262cc4be7f8",
}

export const ZIP_BUNDLES: ZipBundleSpec[] = [
  {
    archiveSha256:
      "563481585d9c44e325a46da7891650d70573fa74008de68f80e7fcc9010c388f",
    nestedArchives: [],
    outputs: [
      {
        archivePath: "HSDC045A.PcbDoc",
        filename: TI_EVM_REFERENCE_FILENAMES.dp83825Evm.pcb,
        sha256:
          "fddf3c35da16904d2c947ed24dbf09bc4e2fead3d42500ef0050055fcb69a138",
      },
    ],
    source: "Texas Instruments DP83825EVM design files SNLR039",
    url: "https://www.ti.com/lit/zip/SNLR039",
  },
  {
    archiveSha256:
      "660117e30c1f12473f18d825a8318a5460a13025a7a6223689ac1f9afd3921d8",
    nestedArchives: [],
    outputs: [
      {
        archivePath: "Board files/DRV8307EVM RevA.PcbDoc",
        filename: TI_EVM_REFERENCE_FILENAMES.drv8307Evm.pcb,
        sha256:
          "e6cd99036f0bc574794d48a91953da856dac0f20bd35fb554152115329f14847",
      },
      {
        archivePath: "Board files/DRV8307EVM RevA.PrjPcb",
        filename: TI_EVM_REFERENCE_FILENAMES.drv8307Evm.project,
        sha256:
          "e8a912b1a75d07b75648ff6d169c774e85bf145c1e0a63ca7e15566553744a60",
      },
      {
        archivePath: "Board files/DRV8307EVM RevA.SchDoc",
        filename: TI_EVM_REFERENCE_FILENAMES.drv8307Evm.schematic,
        sha256:
          "478b7e0d88ea8419da186388e57acb13fcfbee0bc5b9be253b7192e75d79fd07",
      },
    ],
    source: "Texas Instruments DRV8307EVM design files SLVC565A",
    url: "https://www.ti.com/lit/zip/slvc565a",
  },
  {
    archiveSha256:
      "e8a1573658d294c6b47c8cdd8833df2d50302ac242afe88ecb8e60ca2f80b215",
    nestedArchives: [],
    outputs: [
      {
        archivePath: "BMC029A.PcbDoc",
        filename: TI_EVM_REFERENCE_FILENAMES.lm5155EvmFly.pcb,
        sha256:
          "ccc8f911ee9d62bdd22b163e14eef9c29c386295eaa6d317160051174673e134",
      },
      {
        archivePath: "BMC029A.PrjPcb",
        filename: TI_EVM_REFERENCE_FILENAMES.lm5155EvmFly.project,
        sha256:
          "43732f49a7ea71e54a576ce8d0d195cca8b9fc30b32a99b6a5f2e119ab328392",
      },
      {
        archivePath: "BMC029A_SCH.SchDoc",
        filename: TI_EVM_REFERENCE_FILENAMES.lm5155EvmFly.schematic,
        sha256:
          "3b7dbfb4681d2d9e97ad1f41eb13b088d0b2c17038f47c702632605d734e8970",
      },
      {
        archivePath: "BMC029A-HW.SchDoc",
        filename: TI_EVM_REFERENCE_FILENAMES.lm5155EvmFly.hardwareSchematic,
        sha256:
          "947f873d4b746cdbe2cfeabd326cf4c8f3e0c21488169edc64b305091e239fb4",
      },
    ],
    source: "Texas Instruments LM5155EVM-FLY design files SNVR499",
    url: "https://www.ti.com/lit/zip/SNVR499",
  },
  {
    archiveSha256:
      "d538f1bb6dc0976a1d0509faf0a9f6a7932fc1e80ed3730740272fb390e8516f",
    nestedArchives: [],
    outputs: [
      {
        archivePath: "Altium_Files/SR135B.PcbDoc",
        filename: TI_EVM_REFERENCE_FILENAMES.lm251772EvmPd.pcb,
        sha256:
          "4ea0c86dd08d0854a6544a2ef4ca55f5009205820d78073c095dff49ad8b52dd",
      },
      {
        archivePath: "Altium_Files/SR135B.PrjPcb",
        filename: TI_EVM_REFERENCE_FILENAMES.lm251772EvmPd.project,
        sha256:
          "6319939d026b6787992fcfb2315e3a7b4e3b0866fc71a7f2e05a50d42d554108",
      },
      {
        archivePath: "Altium_Files/SR135B.SchDoc",
        filename: TI_EVM_REFERENCE_FILENAMES.lm251772EvmPd.schematic,
        sha256:
          "1ca97d1b95c42f4491d5d1dec9ea262393d7e70a992c434e96c6c810723e648a",
      },
      {
        archivePath: "Altium_Files/SR135B_Hardware.SchDoc",
        filename: TI_EVM_REFERENCE_FILENAMES.lm251772EvmPd.hardwareSchematic,
        sha256:
          "9972780da31436e2a2d7b3d4ac0fa2b09d4ed7e0f3c19d5c6dfbab2b367020da",
      },
    ],
    source: "Texas Instruments LM251772EVM-PD design files SLVC869",
    url: "https://www.ti.com/lit/zip/slvc869",
  },
  {
    archiveSha256:
      "3aba23eea3b9c4751d55468e8716a2c95277b9cd581edc9ae8ef4fb058717b09",
    nestedArchives: [],
    outputs: [
      {
        archivePath: "LMG342X_BB_EVM.PcbDoc",
        filename: TI_EVM_REFERENCE_FILENAMES.lmg342xBbEvm.pcb,
        sha256:
          "450f785560eaf50e8e8ad62b9f2b5bb124ca67fa403f4b3a85ca7009873e0122",
      },
      {
        archivePath: "LMG342X_BB_EVM.PrjPcb",
        filename: TI_EVM_REFERENCE_FILENAMES.lmg342xBbEvm.project,
        sha256:
          "9273df6fe1db9c9524c37bb4526e28932ecdc7044a6762d0b6fe446bad5cd9fe",
      },
      {
        archivePath: "LMG342X_BB_EVM.SchDoc",
        filename: TI_EVM_REFERENCE_FILENAMES.lmg342xBbEvm.schematic,
        sha256:
          "a1f3d59a15dae06027b3c269974a92d672f4c2d6ebb3a42e8fbb8ec4ffa4d9bc",
      },
      {
        archivePath: "LMG342X_BB_EVM_Hardware.SchDoc",
        filename: TI_EVM_REFERENCE_FILENAMES.lmg342xBbEvm.hardwareSchematic,
        sha256:
          "426f2545076e0ca47558e1c8f56aced0864da8f818d4617c6a3fb172a9f82594",
      },
    ],
    source: "Texas Instruments LMG342X-BB-EVM design files SNOC050",
    url: "https://www.ti.com/lit/zip/snoc050",
  },
  {
    archiveSha256:
      "40e6c4d0bea5381bf7b4e0ef26ec4ec9adae156be308e4a3838bd344972b7615",
    nestedArchives: [
      {
        archivePath:
          "TMDS62LEVM Design File Package Altium (Rev. B)/PROC180/PROC181E1_1/3_BoardFile/Altium/PROC181E1-1_PRJPCB.zip",
        outputs: [
          {
            archivePath: "PROC181E1-1_BRD_11_3.pcbdoc",
            filename: TI_TMDS62LEVM_PCB_FILENAME,
            sha256:
              "8444ad8456ff028b7aa11389362ba2fbc01291e87ff46e394576cb044c3612fc",
          },
          ...TI_TMDS62LEVM_SCHEMATIC_SHEET_NUMBERS.map((sheetNumber) => ({
            archivePath: `${sheetNumber}.SchDoc`,
            filename: `${TI_TMDS62LEVM_FIXTURE_NAME}/${sheetNumber}.SchDoc`,
            sha256: tiSchematicHashes[sheetNumber] ?? "",
          })),
        ],
        sha256:
          "636a654aa21de431d5c80519c5b8910a9e0e629cba5216dc3b1cbb4b0e598532",
      },
    ],
    outputs: [],
    source: "Texas Instruments TMDS62LEVM design files SPRCAL9 Rev. B",
    url: "https://www.ti.com/lit/zip/sprcal9",
  },
  {
    archiveSha256:
      "73a47918b97d87275e6365ebde58fefc874f80eb2d473e28ee95a8d13b8751d5",
    nestedArchives: [],
    outputs: [
      {
        archivePath: "PMP23595.PcbDoc",
        filename: TI_POWER_REFERENCE_PCB_FILENAMES.pmp23595,
        sha256:
          "18913410812b0993e4c8c3a00a489335d0fa58d27b79ec02e1294a8a6471e0f6",
      },
    ],
    source: "Texas Instruments PMP23595 CAD/CAE files SLVMEP2A",
    url: "https://www.ti.com/lit/zip/SLVMEP2",
  },
  {
    archiveSha256:
      "f2d4383b8c3713a8e3c68bb46568227075076f55f6f36977fbbef83e7e86bf9e",
    nestedArchives: [],
    outputs: [
      {
        archivePath: "PMP23653B Main CAD/PMP23653B.PcbDoc",
        filename: TI_POWER_REFERENCE_PCB_FILENAMES.pmp23653Main,
        sha256:
          "18a785d61c6fbe381c504f416bb25fa50f16475710b9ce00f36b13b58d57c544",
      },
      {
        archivePath:
          "PMP23653-Planar-Transformer CAD/PMP23653-Planar-Transformer.PcbDoc",
        filename: TI_POWER_REFERENCE_PCB_FILENAMES.pmp23653PlanarTransformer,
        sha256:
          "e291efae1b3d42c8a90d3a01295a3a3129e6721d14163fc7c81045ffa2e29a5c",
      },
    ],
    source: "Texas Instruments PMP23653 CAD/CAE files SLVMF61",
    url: "https://www.ti.com/lit/zip/SLVMF61",
  },
  {
    archiveSha256:
      "4b3ae2e343346c36ffdc60402dcfe330ae07b7c7fd543c8bd2aee413fd1ea5d4",
    nestedArchives: [
      {
        archivePath: "PMP22650 - E2 Altium.zip",
        outputs: [
          {
            archivePath: "PMP22650 PCB.PcbDoc",
            filename: TI_POWER_REFERENCE_PCB_FILENAMES.pmp22650,
            sha256:
              "bc20338d29b9323b5af9182f91041c14b192aa363cf2d7a323441a7f28210002",
          },
        ],
        sha256:
          "b5c33aec2738246f813de7896023dd2d8ff0053c2e3e67d5782f45295bf9a01f",
      },
      {
        archivePath: "PMP22712 - E2 Altium.zip",
        outputs: [
          {
            archivePath: "PMP22712_PCB.PcbDoc",
            filename: TI_POWER_REFERENCE_PCB_FILENAMES.pmp22712,
            sha256:
              "3343b2cb765db52243ccfa584cdded44588d3ad85067e89192f09931b9a309c1",
          },
        ],
        sha256:
          "6c75258db0633e06ed5b117652534e74b53fbb5b69a81417b8068f00ad7f542d",
      },
      {
        archivePath: "PMP22773 - E3 Altium.zip",
        outputs: [
          {
            archivePath: "PMP22773 Rev E3 PCB.PcbDoc",
            filename: TI_POWER_REFERENCE_PCB_FILENAMES.pmp22773,
            sha256:
              "a84ae2b3f463084053987c1bac0ce6c51c1b38b16bf53097d769366cd0eb59f7",
          },
        ],
        sha256:
          "1c2e563678a71c32e8459506430395ddfad17ca42cbe27abc75e594f5b3d6f0c",
      },
    ],
    outputs: [],
    source: "Texas Instruments PMP22650 CAD/CAE files TIDM925",
    url: "https://www.ti.com/lit/zip/TIDM925",
  },
]
