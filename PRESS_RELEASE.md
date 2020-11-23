# superluminar veröffentlicht EKS-Installer
> Der EKS-Installer ermöglicht produktive Workloads 80% schneller als bisher in Betrieb nehmen zu können, dank DNS- und ALB-Integration.

Mit EKS stellt AWS einen gemanagten Kubernetes-Cluster zur Verfügung. Trotzdem müssen Nutzer hohen Aufwand betreiben um den Kubernetes-Cluster produktiv einsetzbar zu bekommen. Es fehlen eine Integration mit AWS Route 53, Loadbalancer für Services, Absicherung der IAM-Policies für Compute-Nodes sowie das kontrollierte Management vorinstallierter Manifeste für Cluster-Networking. All diese Bestandteile müssen nachinstalliert, konfiguriert und in Einklang gebracht werden.

Der von superluminar bereitgestellte Installer folgt dem "batteries included"-Ansatz und stellt obige Komponenten vorkonfiguriert bereit. Nutzer müssen nur noch ihre Route53-Zone angeben und können umgehend Dienste auf den Kubernetes-Cluster ausliefern, die über das Internet erreichbar sind.

> Unsere Kunden sind begeistert. In wenigen Stunden steht ihnen eine schlüsselfertige Lösung bereit, die umgehend nutzbar ist. Bisher wurden oft Tage oder Wochen gebraucht um EKS fertig zu konfigurieren.
>
> Jan Brauer, Co-founder superluminar

Der Installer wird in zwei Varianten ausgeliefert. Für die meisten Nutzer ist das One-Click-Template aus dem AWS Marketplace die richtige Wahl. Um den Cluster in die eigene Infrastructure as Code Umgebung zu integrieren wird außerdem ein CDK-Construct bereitgestellt.  
