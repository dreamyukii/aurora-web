import { Code, Laptop, Monitor, Rocket } from "lucide-react";
import { RefObject, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DownloadComponent from "@/components/sections/download/download-component";
import CheckDocs from "@/components/sections/download/check-docs";
import { DownloadIcon } from "@/components/download-icon";
import { useTranslations } from 'next-intl';

export default function DownloadAurora({
  downloadRef,
}: {
  downloadRef: RefObject<any>;
}) {
  const [systemBase, setSystemBase] = useState("");
  const [primaryGPU, setPrimaryGPU] = useState("");
  const [developerVersion, setDeveloperVersion] = useState("");
  const t = useTranslations('Download-Component');

  return (
    <>
      <div
        ref={downloadRef}
        className={
          "flex min-h-[900px] w-full animate-fade-up flex-col items-center justify-center gap-5"
        }
        id={"downloads"}
      >
        <div className={"mt-5 flex h-full w-3/4 max-w-[900px] flex-col gap-5"}>
          <div className={"items-left flex flex-col gap-4"}>
            <div className={"flex flex-row items-center justify-start gap-5"}>
              <div className={"h-12 w-12 text-aurora-darkblue lg:h-24 lg:w-24"}>
                <DownloadIcon size={96} />
              </div>
              <h1
                className={
                  "flex flex-row items-center justify-center gap-4 bg-gradient-to-r from-aurora-purple to-aurora-blue to-50% bg-clip-text text-5xl font-bold text-transparent drop-shadow-md lg:justify-start lg:text-7xl"
                }
              >
                {t('get-aurora')}
              </h1>
            </div>

            <p
              className={
                "flex flex-col items-center gap-5 text-center text-xl text-black lg:flex-row lg:text-left lg:text-2xl"
              }
            >
              <Rocket className={"stroke-aurora-darkblue"} size={48} /> {t('ready-to-ride')}
            </p>
          </div>
        </div>
        <div
          className={
            "grid w-3/4 max-w-[900px] grid-cols-1 grid-rows-2 gap-10 lg:grid-cols-2 lg:grid-rows-1 lg:gap-0"
          }
        >
          <div
            className={
              "flex flex-col items-center justify-center gap-5 lg:items-start lg:justify-start"
            }
          >
            <div className={"animate-fade-up"}>
              <p className={"text-xl"}>{t('hardware')}</p>
              <Select
                onValueChange={(e) => {
                  setSystemBase(e);
                  console.log(systemBase);
                }}
              >
                <SelectTrigger className="h-[60px] w-[300px] border-aurora-darkblue text-lg">
                  <SelectValue
                    placeholder={
                      <div
                        className={
                          "flex flex-row items-center justify-center gap-1"
                        }
                      >
                        <Laptop className={"stroke-aurora-purple"} />
                        {t('select-hardware')}
                      </div>
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desktop">Desktop / Laptop</SelectItem>
                  <SelectItem value="asus">ASUS</SelectItem>
                  <SelectItem value="surface">Surface</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {systemBase !== "" && (
              <div className={"animate-fade-up"}>
                <p className={"text-xl"}>{t('primary-gpu')}</p>
                <Select
                  onValueChange={(e) => {
                    setPrimaryGPU(e);
                    console.log(systemBase);
                  }}
                >
                  <SelectTrigger className="h-[60px] w-[300px] border-aurora-darkblue text-lg">
                    <SelectValue
                      placeholder={
                        <div
                          className={
                            "flex flex-row items-center justify-center gap-2"
                          }
                        >
                          <Monitor className={"stroke-aurora-purple"} />
                          {t('pick-gpu')}
                        </div>
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="intel">Intel</SelectItem>
                    <SelectItem value="amd">AMD</SelectItem>
                    <SelectItem value="nvidia">Nvidia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {primaryGPU !== "" && (
              <div className={"animate-fade-up"}>
                <p className={"text-xl"}>{t('developer-version')}</p>
                <Select
                  onValueChange={(e) => {
                    setDeveloperVersion(e);
                    console.log(systemBase);
                  }}
                >
                  <SelectTrigger className="h-[60px] w-[300px] border-aurora-darkblue text-lg">
                    <SelectValue
                      placeholder={
                        <div
                          className={
                            "flex flex-row items-center justify-center gap-2"
                          }
                        >
                          <Code className={"stroke-aurora-purple"} />
                          {t('are-you-dev')}
                        </div>
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">{t('yes-option')}</SelectItem>
                    <SelectItem value="no">{t('no-option')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className={"flex flex-col gap-2"}>
            {developerVersion !== "" && (
              <div className={"flex w-full flex-col gap-2 rounded-3xl"}>
                <h1
                  className={
                    "bg-gradient-to-tr from-aurora-lightorange via-aurora-darkblue to-aurora-purple bg-clip-text text-3xl font-bold text-transparent"
                  }
                >
                  {t('grab-iso')}
                </h1>
                <DownloadComponent
                  baseSystem={systemBase}
                  primaryGPU={primaryGPU}
                  developerEdition={developerVersion}
                />
                <CheckDocs />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
