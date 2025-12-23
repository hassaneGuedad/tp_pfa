export interface UMLClass {
  name: string;
  properties: UMLProperty[];
  methods: UMLMethod[];
  extends?: string;
  implements?: string[];
  isInterface: boolean;
  isAbstract: boolean;
}

export interface UMLProperty {
  name: string;
  type: string;
  visibility: 'public' | 'private' | 'protected';
  isStatic: boolean;
  isReadonly: boolean;
}

export interface UMLMethod {
  name: string;
  parameters: UMLParameter[];
  returnType: string;
  visibility: 'public' | 'private' | 'protected';
  isStatic: boolean;
  isAsync: boolean;
}

export interface UMLParameter {
  name: string;
  type: string;
  isOptional: boolean;
}

export interface UMLRelationship {
  from: string;
  to: string;
  type: 'inheritance' | 'association' | 'composition' | 'aggregation' | 'dependency';
  label?: string;
}

export interface UMLData {
  classes: UMLClass[];
  relationships: UMLRelationship[];
  components: string[];
  functions: string[];
}

export class UMLGenerator {
  private classes: UMLClass[] = [];
  private relationships: UMLRelationship[] = [];
  private components: string[] = [];
  private functions: string[] = [];

  analyzeCode(files: any[]): UMLData {
    this.classes = [];
    this.relationships = [];
    this.components = [];
    this.functions = [];

    console.log('UML Generator - Starting analysis of', files.length, 'files');

    files.forEach((file, index) => {
      console.log(`UML Generator - Analyzing file ${index + 1}:`, file.name);
      if (file.content) {
        console.log(`UML Generator - File ${file.name} has content length:`, file.content.length);
        this.analyzeFile(file.content, file.name);
      } else {
        console.log(`UML Generator - File ${file.name} has no content`);
      }
    });

    console.log('UML Generator - Analysis complete:', {
      classes: this.classes.length,
      components: this.components.length,
      relationships: this.relationships.length,
      functions: this.functions.length
    });

    return {
      classes: this.classes,
      relationships: this.relationships,
      components: this.components,
      functions: this.functions
    };
  }

  private analyzeFile(content: string, fileName: string) {
    const lines = content.split('\n');
    let currentClass: UMLClass | null = null;
    let inClass = false;
    let braceCount = 0;
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Try to detect class definition
      const classMatch = this.detectClass(trimmedLine);
      if (classMatch) {
        currentClass = classMatch;
        this.classes.push(currentClass);
        this.addClassRelationships(classMatch);
        inClass = true;
        braceCount = 0;
        return;
      }

      // Try to detect interface definition
      const interfaceMatch = this.detectInterface(trimmedLine);
      if (interfaceMatch) {
        currentClass = interfaceMatch;
        this.classes.push(currentClass);
        this.addInterfaceRelationships(interfaceMatch);
        inClass = true;
        braceCount = 0;
        return;
      }

      // Try to detect enum definition
      const enumMatch = this.detectEnum(trimmedLine);
      if (enumMatch) {
        currentClass = enumMatch;
        this.classes.push(currentClass);
        inClass = true;
        braceCount = 0;
        return;
      }

      // Update brace count and check for class end
      if (inClass && currentClass) {
        braceCount += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
        if (braceCount <= 0) {
          inClass = false;
          currentClass = null;
        }
      }

      // Parse properties and methods within class
      if (inClass && currentClass) {
        this.parseProperty(trimmedLine, currentClass);
        this.parseMethod(trimmedLine, currentClass);
      }

      // Detect React components
      const componentName = this.detectComponent(line);
      if (componentName) this.components.push(componentName);
    });
  }

  private detectClass(trimmedLine: string): UMLClass | null {
    const classMatch = trimmedLine.match(/^(public\s+)?(abstract\s+)?(final\s+)?class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s+implements\s+([\w\s,]+))?/);
    if (!classMatch) return null;
    
    return {
      name: classMatch[4],
      properties: [],
      methods: [],
      extends: classMatch[5],
      implements: classMatch[6]?.split(',').map(i => i.trim()) || [],
      isInterface: false,
      isAbstract: !!classMatch[2]
    };
  }

  private detectInterface(trimmedLine: string): UMLClass | null {
    const interfaceMatch = trimmedLine.match(/^(public\s+)?interface\s+(\w+)(?:\s+extends\s+([\w\s,]+))?/);
    if (!interfaceMatch) return null;

    return {
      name: interfaceMatch[2],
      properties: [],
      methods: [],
      extends: interfaceMatch[3]?.split(',')[0]?.trim(),
      implements: interfaceMatch[3]?.split(',').slice(1).map(i => i.trim()) || [],
      isInterface: true,
      isAbstract: false
    };
  }

  private detectEnum(trimmedLine: string): UMLClass | null {
    const enumMatch = trimmedLine.match(/^(public\s+)?enum\s+(\w+)/);
    if (!enumMatch) return null;

    return {
      name: enumMatch[2],
      properties: [],
      methods: [],
      isInterface: false,
      isAbstract: false
    };
  }

  private addClassRelationships(umlClass: UMLClass): void {
    if (umlClass.extends) {
      this.relationships.push({ from: umlClass.name, to: umlClass.extends, type: 'inheritance' });
    }
    umlClass.implements?.forEach(iface => {
      this.relationships.push({ from: umlClass.name, to: iface, type: 'dependency', label: 'implements' });
    });
  }

  private addInterfaceRelationships(umlInterface: UMLClass): void {
    if (umlInterface.extends) {
      this.relationships.push({ from: umlInterface.name, to: umlInterface.extends, type: 'inheritance' });
    }
    umlInterface.implements?.forEach(iface => {
      this.relationships.push({ from: umlInterface.name, to: iface, type: 'inheritance' });
    });
  }

  private parseProperty(trimmedLine: string, currentClass: UMLClass): void {
    const propertyMatch = trimmedLine.match(/^(private|public|protected|static|final)?\s*(?:static\s+|final\s+)*(\w+)\s+(\w+)\s*;?$/);
    if (propertyMatch && !trimmedLine.includes('(')) {
      currentClass.properties.push({
        name: propertyMatch[3],
        type: propertyMatch[2],
        visibility: (propertyMatch[1] as 'public' | 'private' | 'protected') || 'private',
        isStatic: trimmedLine.includes('static'),
        isReadonly: trimmedLine.includes('final')
      });
    }
  }

  private parseMethod(trimmedLine: string, currentClass: UMLClass): void {
    const methodMatch = trimmedLine.match(/^(private|public|protected)?\s*(?:static\s+|final\s+)*(\w+)\s+(\w+)\s*\(/);
    if (methodMatch && !trimmedLine.includes('class') && !trimmedLine.includes('interface')) {
      currentClass.methods.push({
        name: methodMatch[3],
        parameters: [],
        returnType: methodMatch[2],
        visibility: (methodMatch[1] as 'public' | 'private' | 'protected') || 'public',
        isStatic: trimmedLine.includes('static'),
        isAsync: false
      });
    }
  }

  private detectComponent(line: string): string | null {
    const componentMatch = line.match(/function\s+(\w+)|const\s+(\w+)\s*=\s*\(/);
    const componentName = componentMatch?.[1] || componentMatch?.[2];
    return (componentName && componentName[0] === componentName[0].toUpperCase()) ? componentName : null;
  }

  generateClassDiagram(data: UMLData): string {
    let mermaid = 'classDiagram\n';
    
    // Si aucune classe n'est trouvée, créer un diagramme d'exemple
    if (data.classes.length === 0) {
      mermaid += `    class ExampleClass {
        +String name
        +int id
        +getName() String
        +setName(name) void
    }
    
    class AnotherClass {
        -String description
        +getDescription() String
    }
    
    ExampleClass --> AnotherClass : uses`;
      return mermaid;
    }
    
    // Générer les classes
    data.classes.forEach(cls => {
      mermaid += `    class ${cls.name} {\n`;
      
      // Propriétés
      if (cls.properties.length > 0) {
        cls.properties.forEach(prop => {
          const visibility = prop.visibility === 'private' ? '-' : prop.visibility === 'protected' ? '#' : '+';
          const staticModifier = prop.isStatic ? '$' : '';
          const readonlyModifier = prop.isReadonly ? 'readonly ' : '';
          mermaid += `        ${visibility}${staticModifier}${readonlyModifier}${prop.name} : ${prop.type}\n`;
        });
      } else {
        // Ajouter une propriété par défaut si aucune n'est trouvée
        mermaid += `        +String name\n`;
      }
      
      // Méthodes
      if (cls.methods.length > 0) {
        cls.methods.forEach(method => {
          const visibility = method.visibility === 'private' ? '-' : method.visibility === 'protected' ? '#' : '+';
          const staticModifier = method.isStatic ? '$' : '';
          const asyncModifier = method.isAsync ? 'async ' : '';
          const params = method.parameters.map(p => `${p.name}: ${p.type}`).join(', ');
          mermaid += `        ${visibility}${staticModifier}${asyncModifier}${method.name}(${params}) ${method.returnType}\n`;
        });
      } else {
        // Ajouter une méthode par défaut si aucune n'est trouvée
        mermaid += `        +get${cls.name}() ${cls.name}\n`;
      }
      
      mermaid += `    }\n\n`;
    });
    
    // Générer les relations
    if (data.relationships.length > 0) {
      data.relationships.forEach(rel => {
        switch (rel.type) {
          case 'inheritance':
            mermaid += `    ${rel.from} --|> ${rel.to}\n`;
            break;
          case 'association':
            mermaid += `    ${rel.from} --> ${rel.to} : ${rel.label || 'uses'}\n`;
            break;
          case 'composition':
            mermaid += `    ${rel.from} *-- ${rel.to}\n`;
            break;
          case 'aggregation':
            mermaid += `    ${rel.from} o-- ${rel.to}\n`;
            break;
          case 'dependency':
            mermaid += `    ${rel.from} ..> ${rel.to} : ${rel.label || 'depends'}\n`;
            break;
        }
      });
    } else if (data.classes.length > 1) {
      // Créer des relations par défaut entre les classes
      for (let i = 0; i < data.classes.length - 1; i++) {
        mermaid += `    ${data.classes[i].name} --> ${data.classes[i + 1].name} : uses\n`;
      }
    }
    
    return mermaid;
  }

  generateComponentDiagram(data: UMLData): string {
    let mermaid = 'graph TB\n';
    
    // Générer les composants
    data.components.forEach(component => {
      mermaid += `    ${component}[${component}]\n`;
    });
    
    // Générer les relations entre composants (basées sur les imports)
    data.classes.forEach(cls => {
      if (cls.name.endsWith('Component') || cls.name.endsWith('Page')) {
        cls.properties.forEach(prop => {
          if (prop.type.includes('Component') || prop.type.includes('Page')) {
            const targetComponent = prop.type.replace('[]', '').replace('Component', '').replace('Page', '');
            mermaid += `    ${cls.name} --> ${targetComponent}\n`;
          }
        });
      }
    });
    
    return mermaid;
  }

  generateSequenceDiagram(data: UMLData): string {
    let mermaid = 'sequenceDiagram\n';
    mermaid += `    participant User\n`;
    mermaid += `    participant App\n`;
    
    // Ajouter les composants principaux
    data.components.slice(0, 5).forEach(component => {
      mermaid += `    participant ${component}\n`;
    });
    
    // Générer un flux de base
    mermaid += `    User->>App: Interagit avec l'application\n`;
    mermaid += `    App->>${data.components[0] || 'Component'}: Appel du composant\n`;
    
    data.classes.forEach(cls => {
      if (cls.methods.length > 0) {
        const method = cls.methods[0];
        mermaid += `    ${cls.name}->>${cls.name}: ${method.name}()\n`;
      }
    });
    
    mermaid += `    ${data.components[0] || 'Component'}-->>App: Retour de données\n`;
    mermaid += `    App-->>User: Affichage du résultat\n`;
    
    return mermaid;
  }

  generateActivityDiagram(data: UMLData): string {
    let mermaid = 'flowchart TD\n';
    mermaid += `    A[Début] --> B[Initialisation]\n`;
    mermaid += `    B --> C{Utilisateur connecté?}\n`;
    mermaid += `    C -->|Oui| D[Charger les données]\n`;
    mermaid += `    C -->|Non| E[Rediriger vers login]\n`;
    mermaid += `    D --> F[Afficher l'interface]\n`;
    mermaid += `    F --> G{Action utilisateur}\n`;
    mermaid += `    G -->|Créer| H[Créer un élément]\n`;
    mermaid += `    G -->|Modifier| I[Modifier un élément]\n`;
    mermaid += `    G -->|Supprimer| J[Supprimer un élément]\n`;
    mermaid += `    H --> K[Sauvegarder]\n`;
    mermaid += `    I --> K\n`;
    mermaid += `    J --> K\n`;
    mermaid += `    K --> L[Actualiser l'affichage]\n`;
    mermaid += `    L --> G\n`;
    mermaid += `    E --> M[Fin]\n`;
    
    return mermaid;
  }

  generateERDiagram(data: UMLData): string {
    let mermaid = 'erDiagram\n';
    
    // Créer des entités basées sur les classes
    data.classes.forEach(cls => {
      if (!cls.isInterface && cls.properties.length > 0) {
        mermaid += `    ${cls.name} {\n`;
        cls.properties.forEach(prop => {
          const type = this.mapToDatabaseType(prop.type);
          mermaid += `        ${type} ${prop.name}\n`;
        });
        mermaid += `    }\n\n`;
      }
    });
    
    // Créer des relations basées sur les propriétés
    data.classes.forEach(cls => {
      cls.properties.forEach(prop => {
        if (prop.type.includes('[]') || prop.type.includes('List')) {
          const relatedClass = prop.type.replace('[]', '').replace('List<', '').replace('>', '');
          mermaid += `    ${cls.name} ||--o{ ${relatedClass} : "a plusieurs"\n`;
        }
      });
    });
    
    return mermaid;
  }

  private mapToDatabaseType(typescriptType: string): string {
    const typeMap: { [key: string]: string } = {
      'string': 'varchar',
      'number': 'int',
      'boolean': 'boolean',
      'Date': 'datetime',
      'string[]': 'varchar',
      'number[]': 'int'
    };
    
    return typeMap[typescriptType] || 'varchar';
  }
} 