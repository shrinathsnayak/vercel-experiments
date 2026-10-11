import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { TypeTable } from 'fumadocs-ui/components/type-table';
import { File, Files, Folder } from 'fumadocs-ui/components/files';
import type { MDXComponents } from 'mdx/types';
import { ExperimentCatalog } from '@/components/experiment-catalog';
import { ExperimentDeployButton } from '@/components/experiment-deploy-button';
import { ExperimentEmbed } from '@/components/experiment-embed';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ExperimentCatalog,
    ExperimentEmbed,
    ExperimentDeployButton,
    Step,
    Steps,
    TypeTable,
    File,
    Files,
    Folder,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
