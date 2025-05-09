import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Type-Safe SDK',
    Svg: require('@site/static/img/type-safe-icon.svg').default,
    description: (
      <>
        Full TypeScript support with comprehensive type definitions for a better
        development experience with autocompletion and type checking.
      </>
    ),
  },
  {
    title: 'Simple Integration',
    Svg: require('@site/static/img/simple-integration-icon.svg').default,
    description: (
      <>
        Designed to be easy to integrate with any JavaScript or TypeScript project.
        Just install and import the SDK to get started quickly.
      </>
    ),
  },
  {
    title: 'Comprehensive API Coverage',
    Svg: require('@site/static/img/api-coverage-icon.svg').default,
    description: (
      <>
        Access all Magic Button Cloud features through a clean, consistent, and
        well-documented API with built-in error handling and retries.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
